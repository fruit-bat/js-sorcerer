'use strict';

import Ram from './ExidyMemoryRam';
import {SCREEN_START, SCREEN_SIZE_BYTES} from './ExidyMemory';


export default class ExidyScreen extends Ram {

    private charsCanvas: HTMLCanvasElement;
    private screenCanvas: HTMLCanvasElement;
    private screenCtx: CanvasRenderingContext2D;

    public constructor(
        memory: Uint8Array,
        charsCanvas: HTMLCanvasElement) {
        
        super(memory);
        this.screenCanvas = <HTMLCanvasElement>document.createElement('canvas');
        this.screenCanvas.width = 512;
        this.screenCanvas.height = 240;
        this.charsCanvas = charsCanvas;
        this.screenCtx = this.screenCanvas.getContext('2d');
    }

    public get canvas(): HTMLCanvasElement {
        return this.screenCanvas;
    }

    writeByte(address: number, data: number): void {
        if (data !== this.readByte(address)) {
            super.writeByte(address, data);
            this.updateByte(address, data);
        }
    }

    private updateByte(address: number, data: number): void {
        const index = address - SCREEN_START;
        const row = index >> 6;
        const col = index - (row << 6);
        const char = this.readByte(address);
        this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 3, 8, 8);
    }

    public charUpdated(updatedChar: number): void {
        for (let address = SCREEN_START; address < SCREEN_START + SCREEN_SIZE_BYTES; ++address) {
            const char = this.readByte(address);
            if (updatedChar === char) {
                this.updateByte(address, char);
            }
        }
    }

    public updateAll(): void {
        for (let address = SCREEN_START ; address < SCREEN_START + SCREEN_SIZE_BYTES ; ++address) {
            const char = this.readByte(address);
            this.updateByte(address, char);
        }
    }
}
