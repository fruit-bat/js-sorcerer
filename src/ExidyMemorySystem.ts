'use strict';

import Memory from './ExidyMemory';
import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';
import MemoryRegion from './ExidyMemoryRegion';
import NoMemory from './ExidyMemoryNone';
import {MEMORY_SIZE_IN_BYTES, CHARS_START, CHARS_SIZE_BYTES, SCREEN_START, SCREEN_SIZE_BYTES} from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';

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

    public setHandler(address: number, length: number, handler: MemoryTyped): void {
        if (!this.checkGranularity(address) || !this.checkGranularity(length)) {
          console.log('WARNING: handler granularity missmatch');
          console.log(address.toString(16) + " " + length.toString(16));
        }
        this.handlers.fill(
          handler,
          address >> this._ignoreBits,
          (address + length) >> this._ignoreBits);
    }

    public getRegions(): Array<MemoryRegion> {
        const regions: Array<MemoryRegion> = [];
        let start: number = null;
        let memoryType: MemoryType = null;
        for (let i = 0; i < this.handlers.length + 1; ++i) {
            const nextMemoryType = i < this.handlers.length ? this.handlers[i].memoryType() : null;
            const address: number = i << this._ignoreBits;
            if (nextMemoryType != memoryType) {
                if (memoryType !== null) {
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

    private ram = new Ram(this._memory);
    private rom = new Rom(this._memory);

    private multiplexor = new Multiplexor();

    private exidyCharacters: ExidyCharacters;
    private exidyScreen: ExidyScreen;

    public constructor() {

        this.multiplexor.setHandler(0, MEMORY_SIZE_IN_BYTES, this.ram);

        this.multiplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);

        const charsCanvas = <HTMLCanvasElement>document.createElement('canvas');

        charsCanvas.width = 2048;
        charsCanvas.height = 8;

        this.exidyScreen = new ExidyScreen(this._memory, charsCanvas);
        this.exidyCharacters = new ExidyCharacters(this._memory, charsCanvas, (char, row) => {
            this.exidyScreen.charUpdated(char, row);
        });

        this.multiplexor.setHandler(SCREEN_START, SCREEN_SIZE_BYTES, this.exidyScreen);
        this.multiplexor.setHandler(0xFC00, 0x0400, this.exidyCharacters);
    }

    public get screenCanvas(): HTMLCanvasElement {
        return this.exidyScreen.canvas;
    }

    public load(data: Uint8Array, address: number, start: number = 0): void {
        this._memory.set(data.subarray(start), address);
    }

    public loadRom(data: Uint8Array, address: number): void {
        this._memory.set(data, address);
        this.multiplexor.setHandler(address, data.length, this.rom);
    }

    public ejectRom(address: number, length: number): void {
        this.multiplexor.setHandler(address, length, this.ram);
        this._memory.fill(0, address, address + length);
    }

    public get memory(): Memory {
        return this.multiplexor;
    }

    public updateCharacters(): void {
        this.exidyCharacters.updateAll();
    }

    public updateScreen(): void {
        this.exidyScreen.updateAll();
    }

    public setHandler(address: number, length: number, handler: MemoryTyped): void {
        this.multiplexor.setHandler(address, length, handler);
    }

    public getMem(start, length): Uint8Array {
        return this._memory.subarray(start, start+length);
    }

    public getRegions(): Array<MemoryRegion> {
        return this.multiplexor.getRegions();
    }
}
