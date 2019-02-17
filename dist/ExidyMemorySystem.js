'use strict';
import MemoryTypes from './ExidyMemoryTypes';
import MemoryRegion from './ExidyMemoryRegion';
import NoMemory from './ExidyMemoryNone';
import { MEMORY_SIZE_IN_BYTES } from './ExidyMemory';
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
    fill(address, length, handler) {
        if (!this.checkGranularity(address) || !this.checkGranularity(length)) {
            console.log('WARNING: handler granularity missmatch');
            console.log(address.toString(16) + " " + length.toString(16));
        }
        this.handlers.fill(handler, address >> this._ignoreBits, (address + length) >> this._ignoreBits);
    }
    clearHandler(memoryType) {
        const address = memoryType.start;
        const length = memoryType.length;
        this.fill(address, length, new NoMemory());
    }
    setHandler(handler) {
        const address = handler.memoryType().start;
        const length = handler.memoryType().length;
        this.fill(address, length, handler);
    }
    getRegions() {
        const regions = [];
        let start = null;
        let memoryType = null;
        for (let i = 0; i < this.handlers.length + 1; ++i) {
            const nextMemoryType = i < this.handlers.length ? this.handlers[i].memoryType() : null;
            const typeCode = memoryType ? memoryType.code : null;
            const nextTypeCode = nextMemoryType ? nextMemoryType.code : null;
            const address = i << this._ignoreBits;
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
    constructor() {
        this._memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);
        this.multiplexor = new Multiplexor();
        this.multiplexor.setHandler(new NoMemory());
        this.multiplexor.setHandler(new Ram(this._memory, MemoryTypes.Ram));
        const charsCanvas = document.createElement('canvas');
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
    get screenCanvas() {
        return this.exidyScreen.canvas;
    }
    loadRom(data, memoryType) {
        const start = memoryType.start;
        const length = memoryType.length;
        if (data.length !== length) {
            throw new Error('ROM length mismatch');
        }
        this._memory.set(data, start);
        this.multiplexor.setHandler(new Rom(this._memory, memoryType));
    }
    loadMonitorRom(data) {
        this.loadRom(data, MemoryTypes.MonitorRom);
    }
    loadDiskSystemRom(data) {
        this.loadRom(data, MemoryTypes.DiskSystemRom);
    }
    loadDiskSystem(diskSystem) {
        this.multiplexor.setHandler(diskSystem);
    }
    loadAsciiCharacterRom(data) {
        this.loadRom(data, MemoryTypes.AsciiCharacterRom);
    }
    loadRomPack8K(data) {
        this.loadRom(data, MemoryTypes.RomPack8K);
    }
    ejectRomPack8K() {
        this.multiplexor.clearHandler(MemoryTypes.RomPack8K);
        this._memory.fill(0, MemoryTypes.RomPack8K.start, MemoryTypes.RomPack8K.start + MemoryTypes.RomPack8K.length);
    }
    load(data, address, start = 0) {
        this._memory.set(data.subarray(start), address);
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
    getMem(start, length) {
        return this._memory.subarray(start, start + length);
    }
    getRegions() {
        return this.multiplexor.getRegions();
    }
}
