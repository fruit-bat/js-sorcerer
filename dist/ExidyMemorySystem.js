'use strict';
import MemoryTyped from './ExidyMemoryTyped';
import MemoryTypes from './ExidyMemoryTypes';
import MemoryRegion from './ExidyMemoryRegion';
import { MEMORY_SIZE_IN_BYTES } from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';
class Multiplexor {
    constructor(nomem) {
        this._ignoreBits = 7;
        this.handlers = new Array(MEMORY_SIZE_IN_BYTES >> this._ignoreBits);
        this.handlers.fill(nomem);
        this._nomem = nomem;
    }
    readByte(address) {
        return this.handlers[address >>> this._ignoreBits].memory().readByte(address);
    }
    writeByte(address, data) {
        this.handlers[address >>> this._ignoreBits].memory().writeByte(address, data);
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
        this.fill(address, length, this._nomem);
    }
    setHandler(handler, address, length) {
        this.fill(address == undefined ? handler.memoryType().start : address, length == undefined ? handler.memoryType().length : length, handler);
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
        this._handlerMap = new Map();
        const charsCanvas = document.createElement('canvas');
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
        this._handlerMap[MemoryTypes.RomPack8K.code] = new MemoryTyped(this._rom, MemoryTypes.RomPack8K);
        this._handlerMap[MemoryTypes.MonitorRom.code] = new MemoryTyped(this._rom, MemoryTypes.MonitorRom);
        this._handlerMap[MemoryTypes.VideoScratchRam.code] = new MemoryTyped(this._ram, MemoryTypes.VideoScratchRam);
        this._handlerMap[MemoryTypes.ScreenRam.code] = new MemoryTyped(this.exidyScreen, MemoryTypes.ScreenRam);
        this._handlerMap[MemoryTypes.AsciiCharacterRom.code] = new MemoryTyped(this._rom, MemoryTypes.AsciiCharacterRom);
        this._handlerMap[MemoryTypes.UserCharacterRam.code] = new MemoryTyped(this.exidyCharacters, MemoryTypes.UserCharacterRam);
        this.multiplexor = new Multiplexor(this._handlerMap[MemoryTypes.None.code]);
        this.loadDefaults();
    }
    loadDefaults() {
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.None.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.Ram.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.VideoScratchRam.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.ScreenRam.code]);
        this.multiplexor.setHandler(this._handlerMap[MemoryTypes.UserCharacterRam.code]);
    }
    loadRegion(region) {
        const handler = this._handlerMap[region.memoryType.code];
        if (handler == undefined) {
            throw new Error('Missing memory handler for type ' + region.memoryType.code);
        }
        this.multiplexor.setHandler(handler, region.start, region.length);
    }
    loadRegions(regions) {
        regions.forEach(region => { this.loadRegion(region); });
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
        this.multiplexor.setHandler(new MemoryTyped(this._rom, memoryType));
    }
    loadMonitorRom(data) {
        this.loadRom(data, MemoryTypes.MonitorRom);
    }
    loadDiskSystemRom(data) {
        this.loadRom(data, MemoryTypes.DiskSystemRom);
    }
    loadDiskSystem(diskSystem) {
        this.multiplexor.setHandler(new MemoryTyped(diskSystem, MemoryTypes.DiskSystemInterface));
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
    getSnp2RegionsSize() {
        return 1 +
            MemoryRegion.getSnp2Size() * this.getRegions().length;
    }
    saveSnp2Regions(data, address) {
        const regions = this.getRegions();
        data[address++] = regions.length;
        for (let i = 0; i < regions.length; ++i) {
            address += regions[i].saveSnp2(data, address);
        }
    }
    loadSnp2Regions(data, address) {
        const numberOfRegions = data[address++];
        for (let i = 0; i < numberOfRegions; ++i) {
            const region = MemoryRegion.loadSnp2(data, address);
            this.loadRegion(region);
            address += MemoryRegion.getSnp2Size();
        }
    }
    getSnp2Size() {
        return this._memory.length + this.getSnp2RegionsSize();
    }
    saveSnp2(data, address) {
        data.set(this._memory, address);
        this.saveSnp2Regions(data, address + this._memory.length);
    }
    loadSnp2(data, address) {
        const regionsAddress = address + MEMORY_SIZE_IN_BYTES;
        this._memory.set(data.subarray(address, regionsAddress));
        this.loadSnp2Regions(data, regionsAddress);
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
