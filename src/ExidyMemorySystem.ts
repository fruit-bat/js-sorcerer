'use strict';

import Memory from './ExidyMemory';
import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';
import MemoryTypes from './ExidyMemoryTypes';
import MemoryRegion from './ExidyMemoryRegion';
import NoMemory from './ExidyMemoryNone';
import {MEMORY_SIZE_IN_BYTES} from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';
import DiskSystem from './ExidyDiskSystem';

class Multiplexor implements Memory {

    private _ignoreBits: number = 7;

    private handlers: Array<MemoryTyped>;
    private _nomem : MemoryTyped;

    public constructor(nomem: MemoryTyped) {
        this.handlers = new Array<MemoryTyped>(MEMORY_SIZE_IN_BYTES >> this._ignoreBits);
        this.handlers.fill(nomem);
        this._nomem = nomem;
    }

    readByte(address: number): number {
        return this.handlers[address >>> this._ignoreBits].memory().readByte(address);
    }

    writeByte(address: number, data: number): void {
        this.handlers[address >>> this._ignoreBits].memory().writeByte(address, data);
    }

    private checkGranularity(address: number): boolean {
        return ((address >>> this._ignoreBits) << this._ignoreBits) === address;
    }

    private fill(address: number, length: number, handler: MemoryTyped): void {
        if (!this.checkGranularity(address) || !this.checkGranularity(length)) {
          console.log('WARNING: handler granularity missmatch');
          console.log(address.toString(16) + " " + length.toString(16));
        }
        this.handlers.fill(
          handler,
          address >> this._ignoreBits,
          (address + length) >> this._ignoreBits);
    }

    public clearHandler(memoryType: MemoryType): void {
        const address = memoryType.start;
        const length = memoryType.length;
        this.fill(address, length, this._nomem);
    }

    public setHandler(handler: MemoryTyped, address?: number, length?: number): void {
        this.fill(
            address == undefined ? handler.memoryType().start : address,
            length == undefined ? handler.memoryType().length : length,
            handler);
    }

    public getRegions(): Array<MemoryRegion> {
        const regions: Array<MemoryRegion> = [];
        let start: number = null;
        let memoryType: MemoryType = null;
        for (let i = 0; i < this.handlers.length + 1; ++i) {
            const nextMemoryType = i < this.handlers.length ? this.handlers[i].memoryType() : null;
            const typeCode = memoryType ? memoryType.code : null;
            const nextTypeCode = nextMemoryType ? nextMemoryType.code : null;
            const address: number = i << this._ignoreBits;
            if (nextTypeCode != typeCode) {
                if (typeCode !== null) {
                    regions.push(new MemoryRegion(memoryType, start, address - start));
                }
                start = address;
                memoryType = nextMemoryType;
            }
        }
        return regions;
    }
}

export default class MemorySystem {

    private _memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);
    private _ram: Ram;
    private _rom: Rom;

    private multiplexor: Multiplexor;

    private exidyCharacters: ExidyCharacters;
    private exidyScreen: ExidyScreen;

    private _handlerMap: Map<number, MemoryTyped> = new Map();

    // TODO Pass in disk system handler
    public constructor() {

        const charsCanvas = <HTMLCanvasElement>document.createElement('canvas');

        charsCanvas.width = 2048;
        charsCanvas.height = 8;

        this.exidyScreen = new ExidyScreen(this._memory, charsCanvas);
        this.exidyCharacters = new ExidyCharacters(this._memory, charsCanvas, (char, row) => {
            this.exidyScreen.charUpdated(char, row);
        });

        this._ram = new Ram(this._memory);
        this._rom = new Rom(this._memory);
        this._handlerMap[MemoryTypes.None.code] = new MemoryTyped(this._rom, MemoryTypes.None);
        this._handlerMap[MemoryTypes.Ram.code] = new MemoryTyped(this._ram, MemoryTypes.Ram);
        this._handlerMap[MemoryTypes.DiskSystemRom.code] = new MemoryTyped(this._rom, MemoryTypes.DiskSystemRom);
        // TODO this._handlerMap[MemoryTypes.DiskSystemInterface.code] = new NoMemory();
        this._handlerMap[MemoryTypes.RomPack8K.code] = new MemoryTyped(this._rom, MemoryTypes.RomPack8K);
        this._handlerMap[MemoryTypes.MonitorRom.code] = new MemoryTyped(this._rom, MemoryTypes.MonitorRom);
        this._handlerMap[MemoryTypes.VideoScratchRam.code] = new MemoryTyped(this._ram, MemoryTypes.VideoScratchRam);
        this._handlerMap[MemoryTypes.ScreenRam.code] = new MemoryTyped(this.exidyScreen, MemoryTypes.ScreenRam);
        this._handlerMap[MemoryTypes.AsciiCharacterRom.code] = new MemoryTyped(this._rom, MemoryTypes.AsciiCharacterRom);
        this._handlerMap[MemoryTypes.UserCharacterRam.code] = new MemoryTyped(this.exidyCharacters, MemoryTypes.UserCharacterRam);

        this.multiplexor = new Multiplexor(this._handlerMap[MemoryTypes.None.code]);

        this.loadDefaults();
    }

    public loadDefaults() {
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.None.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.Ram.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.VideoScratchRam.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.ScreenRam.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.UserCharacterRam.code]);
    }

    public loadRegion(region: MemoryRegion): void {
        const handler = this._handlerMap[region.memoryType.code];
        if (handler == undefined) {
            throw new Error('Missing memory handler for type ' + region.memoryType.code);
        }
        this.multiplexor.setHandler(
            handler,
            region.start,
            region.length);
    }

    public loadRegions(regions: Array<MemoryRegion>): void {
        regions.forEach(region => { this.loadRegion(region); });
    }

    public get screenCanvas(): HTMLCanvasElement {
        return this.exidyScreen.canvas;
    }

    private loadRom(data: Uint8Array, memoryType: MemoryType): void {
        const start = memoryType.start;
        const length = memoryType.length;
        if (data.length !== length) {
            throw new Error('ROM length mismatch');
        }
        this._memory.set(data, start);
        this.multiplexor.setHandler(new MemoryTyped(this._rom, memoryType));
    }

    public loadMonitorRom(data: Uint8Array): void {
        this.loadRom(data, MemoryTypes.MonitorRom);
    }

    public loadDiskSystemRom(data: Uint8Array): void {
        this.loadRom(data, MemoryTypes.DiskSystemRom);
    }

    public loadDiskSystem(diskSystem: DiskSystem): void {
        this.multiplexor.setHandler(new MemoryTyped(diskSystem, MemoryTypes.DiskSystemInterface));
    }

    public loadAsciiCharacterRom(data: Uint8Array): void {
        this.loadRom(data, MemoryTypes.AsciiCharacterRom);
    }

    public loadRomPack8K(data: Uint8Array): void {
        this.loadRom(data, MemoryTypes.RomPack8K);
    }

    public ejectRomPack8K(): void {
        this.multiplexor.clearHandler(MemoryTypes.RomPack8K);
        this._memory.fill(
          0,
          MemoryTypes.RomPack8K.start,
          MemoryTypes.RomPack8K.start + MemoryTypes.RomPack8K.length);
    }

    private getSnp2RegionsSize(): number {
        return 1 + // 1 byte for number of regions
            MemoryRegion.getSnp2Size() * this.getRegions().length;
    }

    private saveSnp2Regions(data: Uint8Array, address: number): void {
        const regions = this.getRegions();
        // TODO Check we have less that 256 regions
        data[address++] = regions.length;
        for (let i = 0; i < regions.length; ++i) {
            address += regions[i].saveSnp2(data, address);
        }
    }

    private loadSnp2Regions(data: Uint8Array, address: number): void {
        const numberOfRegions = data[address++];
        for (let i = 0; i < numberOfRegions; ++i) {
            const region = MemoryRegion.loadSnp2(data, address);
            this.loadRegion(region);
            address += MemoryRegion.getSnp2Size();
        }
    }

    private getSnp2Size(): number {
        return this._memory.length + this.getSnp2RegionsSize();
    }

    private saveSnp2(data: Uint8Array, address: number): void {
        data.set(this._memory, address);
        this.saveSnp2Regions(data, address + this._memory.length);
    }

    public loadSnp2(data: Uint8Array, address: number): void {
        const regionsAddress = address + MEMORY_SIZE_IN_BYTES;
        this._memory.set(data.subarray(address, regionsAddress));
        this.loadSnp2Regions(data, regionsAddress);
    }

    // Deprecated
    public load(data: Uint8Array, address: number, start: number = 0): void {
        this._memory.set(data.subarray(start), address);
    }

    // Deprecated
    public get memory(): Memory {
        return this.multiplexor;
    }

    public updateCharacters(): void {
        this.exidyCharacters.updateAll();
    }

    public updateScreen(): void {
        this.exidyScreen.updateAll();
    }

    public getMem(start, length): Uint8Array {
        return this._memory.subarray(start, start+length);
    }

    public getRegions(): Array<MemoryRegion> {
        return this.multiplexor.getRegions();
    }

}
