'use strict';

import Ram from './ExidyMemoryRam';
import {CHARS_START} from './ExidyMemory';

//
// 0xF800 - 0xFBFF - ASCII ROM character set
// 0xFC00 - 0xFDFF - Standard graphics
// 0xFE00 - 0xFFFF - User defined graphics
//
// TODO Split into RAM/ROM segments
//
export default class ExidyCharacters extends Ram {

    private charsCanvas: HTMLCanvasElement;
    private charsCtx: CanvasRenderingContext2D;
    private byteCanvas: HTMLCanvasElement;
    private byteCtx: CanvasRenderingContext2D;
    private charUpdated: (char: number, row: number) => void;

    public constructor(
        memory: Uint8Array,
        charsCanvas: HTMLCanvasElement,
        charUpdated: (char: number, row: number) => void) {

        super(memory);
        this.charsCanvas = charsCanvas;
        this.byteCanvas = <HTMLCanvasElement>document.createElement('canvas');
        this.byteCanvas.width = 8;
        this.byteCanvas.height = 256;
        this.byteCtx = this.byteCanvas.getContext('2d');
        this.charsCtx = this.charsCanvas.getContext('2d');
        this.charUpdated = charUpdated;

        for (let i = 0; i < 256; ++i) {
            let j = i;
            for (let x = 0; x < 8; ++x) {
                this.byteCtx.fillStyle = ((j & 0x80) === 0x80) ? 'white' : 'black';
                this.byteCtx.fillRect(x, i, 1, 1);
                j <<= 1;
            }
        }
    }

    writeByte(address: number, data: number): void {
        if (address >= 0xFC00 && (data !== this.readByte(address))) {
            super.writeByte(address, data);
            const offset = address - CHARS_START;
            const row = offset & 0x7;
            const char = offset >> 3;
            this.charsCtx.drawImage(this.byteCanvas, 0, data, 8, 1, char << 3, row, 8, 1);
            this.charUpdated(char, row);
        }
    }

    public updateAll(): void {
        for (let i = 0; i < (256 << 3); ++i) {
            const data = this.readByte(CHARS_START + i);
            const row = i & 0x7;
            const char = i >> 3;
            this.charsCtx.drawImage(this.byteCanvas, 0, data, 8, 1, char << 3, row, 8, 1);
        }
    }
}
