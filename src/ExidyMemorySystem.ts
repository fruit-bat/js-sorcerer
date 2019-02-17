'use strict';

import Memory from './ExidyMemory';
import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';
import MemoryTypes from './ExidyMemoryTypes';
import MemoryRegion from './ExidyMemoryRegion';
import NoMemory from './ExidyMemoryNone';
import {MEMORY_SIZE_IN_BYTES, CHARS_START, CHARS_SIZE_BYTES, SCREEN_START, SCREEN_SIZE_BYTES} from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';
import DiskSystem from './ExidyDiskSystem';

class Multiplexor implements Memory {

    private _ignoreBits: number = 7;

    private handlers: Array<MemoryTyped>;

    public constructor() {
        this.handlers = new Array<MemoryTyped>(MEMORY_SIZE_IN_BYTES >> this._ignoreBits);
        this.handlers.fill(new NoMemory());
    }

    readByte(address: number): number {
        return this.handlers[address >>> this._ignoreBits].readByte(address);
    }

    writeByte(address: number, data: number): void {
        this.handlers[address >>> this._ignoreBits].writeByte(address, data);
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
        this.fill(address, length, new NoMemory());
    }

    public setHandler(handler: MemoryTyped): void {
        const address = handler.memoryType().start;
        const length = handler.memoryType().length;
        this.fill(address, length, handler);
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

    private multiplexor = new Multiplexor();

    private exidyCharacters: ExidyCharacters;
    private exidyScreen: ExidyScreen;

    public constructor() {

        this.multiplexor.setHandler(new NoMemory());
        this.multiplexor.setHandler(new Ram(this._memory, MemoryTypes.Ram));

        const charsCanvas = <HTMLCanvasElement>document.createElement('canvas');

        charsCanvas.width = 2048;
        charsCanvas.height = 8;

        this.multiplexor.setHandler(new Ram(this._memory, MemoryTypes.VideoScratchRam));
        this.exidyScreen = new ExidyScreen(this._memory, charsCanvas);
        this.exidyCharacters = new ExidyCharacters(this._memory, charsCanvas, (char, row) => {
            this.exidyScreen.charUpdated(char, row);
        });

        this.multiplexor.setHandler(this.exidyScreen);
        this.multiplexor.setHandler(this.exidyCharacters);
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
        this.multiplexor.setHandler(new Rom(this._memory, memoryType));
    }

    public loadMonitorRom(data: Uint8Array): void {
        this.loadRom(data, MemoryTypes.MonitorRom);
    }

    public loadDiskSystemRom(data: Uint8Array): void {
        this.loadRom(data, MemoryTypes.DiskSystemRom);
    }

    public loadDiskSystem(diskSystem: DiskSystem): void {
        this.multiplexor.setHandler(diskSystem);
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
