'use strict';
import NoMemory from './ExidyMemoryNone';
import { MEMORY_SIZE_IN_BYTES, CHARS_START, CHARS_SIZE_BYTES, SCREEN_START, SCREEN_SIZE_BYTES } from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';
class Multiplexor {
    constructor() {
        this.handlers = new Array(MEMORY_SIZE_IN_BYTES);
        this.handlers.fill(new NoMemory());
    }
    readByte(address) {
        return this.handlers[address].readByte(address);
    }
    writeByte(address, data) {
        this.handlers[address].writeByte(address, data);
    }
    setHandler(address, length, handler) {
        this.handlers.fill(handler, address, address + length);
    }
}
export default class MemorySystem {
    constructor() {
        this._memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);
        this.ram = new Ram(this._memory);
        this.rom = new Rom(this._memory);
        this.multplexor = new Multiplexor();
        this.multplexor.setHandler(0, MEMORY_SIZE_IN_BYTES, this.ram);
        this.multplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);
        const charsCanvas = document.createElement('canvas');
        charsCanvas.width = 2048;
        charsCanvas.height = 8;
        this.exidyScreen = new ExidyScreen(this._memory, charsCanvas);
        this.exidyCharacters = new ExidyCharacters(this._memory, charsCanvas, (char, row) => {
            this.exidyScreen.charUpdated(char, row);
        });
        this.multplexor.setHandler(SCREEN_START, SCREEN_SIZE_BYTES, this.exidyScreen);
        this.multplexor.setHandler(CHARS_START, CHARS_SIZE_BYTES, this.exidyCharacters);
    }
    get screenCanvas() {
        return this.exidyScreen.canvas;
    }
    load(data, address, start = 0) {
        this._memory.set(data.subarray(start), address);
    }
    loadRom(data, address) {
        this._memory.set(data, address);
        this.multplexor.setHandler(address, data.length, this.rom);
    }
    ejectRom(address, length) {
        this.multplexor.setHandler(address, length, this.ram);
        this._memory.fill(255, address, address + length);
    }
    get memory() {
        return this.multplexor;
    }
    updateCharacters() {
        this.exidyCharacters.updateAll();
    }
    updateScreen() {
        this.exidyScreen.updateAll();
    }
    setHandler(address, length, handler) {
        this.multplexor.setHandler(address, length, handler);
    }
    getMem(start, length) {
        return this._memory.subarray(start, start + length);
    }
}