'use strict';
import Ram from './ExidyMemoryRam';
import { SCREEN_START, SCREEN_SIZE_BYTES } from './ExidyMemory';
export default class ExidyScreen extends Ram {
    constructor(memory, charsCanvas) {
        super(memory);
        this.screenCanvas = document.createElement('canvas');
        this.screenCanvas.width = 512;
        this.screenCanvas.height = 240;
        this.charsCanvas = charsCanvas;
        this.screenCtx = this.screenCanvas.getContext('2d');
    }
    get canvas() {
        return this.screenCanvas;
    }
    writeByte(address, data) {
        if (data !== this.readByte(address)) {
            super.writeByte(address, data);
            this.updateByte(address, data);
        }
    }
    updateByte(address, data) {
        const index = address - SCREEN_START;
        const row = index >> 6;
        const col = index - (row << 6);
        const char = this.readByte(address);
        this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 3, 8, 8);
    }
    charUpdated(updatedChar, updatedRow) {
        for (let address = SCREEN_START; address < SCREEN_START + SCREEN_SIZE_BYTES; ++address) {
            const char = this.readByte(address);
            if (updatedChar === char) {
                const index = address - SCREEN_START;
                const row = index >> 6;
                const col = index - (row << 6);
                this.screenCtx.drawImage(this.charsCanvas, char << 3, updatedRow, 8, 1, col << 3, (row << 3) + updatedRow, 8, 1);
            }
        }
    }
    updateAll() {
        for (let address = SCREEN_START; address < SCREEN_START + SCREEN_SIZE_BYTES; ++address) {
            const char = this.readByte(address);
            this.updateByte(address, char);
        }
    }
}
