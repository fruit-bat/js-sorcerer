'use strict';
import MemoryRegion from './ExidyMemoryRegion';
import NoMemory from './ExidyMemoryNone';
import { MEMORY_SIZE_IN_BYTES, CHARS_START, CHARS_SIZE_BYTES, SCREEN_START, SCREEN_SIZE_BYTES } from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';
class Multiplexor {
    constructor() {
        this._ignoreBits = 7;
        this.handlers = new Array(MEMORY_SIZE_IN_BYTES >> this._ignoreBits);
        this.handlers.fill(new NoMemory());
    }
    readByte(address) {
        return this.handlers[address >>> this._ignoreBits].readByte(address);
    }
    writeByte(address, data) {
        this.handlers[address >>> this._ignoreBits].writeByte(address, data);
    }
    checkGranularity(address) {
        return ((address >>> this._ignoreBits) << this._ignoreBits) === address;
    }
    setHandler(address, length, handler) {
        if (!this.checkGranularity(address) || !this.checkGranularity(length)) {
            console.log('WARNING: handler granularity missmatch');
            console.log(address.toString(16) + " " + length.toString(16));
        }
        this.handlers.fill(handler, address >> this._ignoreBits, (address + length) >> this._ignoreBits);
    }
    getRegions() {
        const regions = [];
        let start = null;
        let memoryType = null;
        for (let i = 0; i < this.handlers.length + 1; ++i) {
            const nextMemoryType = i < this.handlers.length ? this.handlers[i].memoryType() : null;
            const address = i << this._ignoreBits;
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
    constructor() {
        this._memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);
        this.ram = new Ram(this._memory);
        this.rom = new Rom(this._memory);
        this.multiplexor = new Multiplexor();
        this.multiplexor.setHandler(0, MEMORY_SIZE_IN_BYTES, this.ram);
        this.multiplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);
        const charsCanvas = document.createElement('canvas');
        charsCanvas.width = 2048;
        charsCanvas.height = 8;
        this.exidyScreen = new ExidyScreen(this._memory, charsCanvas);
        this.exidyCharacters = new ExidyCharacters(this._memory, charsCanvas, (char, row) => {
            this.exidyScreen.charUpdated(char, row);
        });
        this.multiplexor.setHandler(SCREEN_START, SCREEN_SIZE_BYTES, this.exidyScreen);
        this.multiplexor.setHandler(CHARS_START, CHARS_SIZE_BYTES, this.exidyCharacters);
    }
    get screenCanvas() {
        return this.exidyScreen.canvas;
    }
    load(data, address, start = 0) {
        this._memory.set(data.subarray(start), address);
    }
    loadRom(data, address) {
        this._memory.set(data, address);
        this.multiplexor.setHandler(address, data.length, this.rom);
    }
    ejectRom(address, length) {
        this.multiplexor.setHandler(address, length, this.ram);
        this._memory.fill(0, address, address + length);
    }
    get memory() {
        return this.multiplexor;
    }
    updateCharacters() {
        this.exidyCharacters.updateAll();
    }
    updateScreen() {
        this.exidyScreen.updateAll();
    }
    setHandler(address, length, handler) {
        this.multiplexor.setHandler(address, length, handler);
    }
    getMem(start, length) {
        return this._memory.subarray(start, start + length);
    }
    getRegions() {
        return this.multiplexor.getRegions();
    }
}
