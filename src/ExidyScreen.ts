"use strict"

import Ram from './ExidyMemoryRam';
import {SCREEN_START, SCREEN_SIZE_BYTES} from './ExidyMemory';


export default class ExidyScreen extends Ram {

	private charsCanvas : HTMLCanvasElement;
	private screenCanvas : HTMLCanvasElement;
	private screenCtx : CanvasRenderingContext2D;

	public constructor(
		memory : Uint8Array,
		charsCanvas : HTMLCanvasElement,
		screenCanvas : HTMLCanvasElement)
	{
		super(memory);
		this.screenCanvas = screenCanvas;
		this.charsCanvas = charsCanvas;
		this.screenCtx = screenCanvas.getContext("2d");
	}

	writeByte(address: number, data: number) : void {
		if(data !== this.readByte(address)) {
			super.writeByte(address, data);
			this.updateByte(address, data);
		}
	}

	private updateByte(address: number, data: number) : void {
		let index = address - SCREEN_START;
		let row = index >> 6;
		let col = index - (row << 6);
		let char = this.readByte(address);
		this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 3, 8, 8);
	}

	public charUpdated(updatedChar: number) : void {
		for(let address = SCREEN_START; address < SCREEN_START + SCREEN_SIZE_BYTES; ++address) {
			let char = this.readByte(address);
			if(updatedChar === char) {
				this.updateByte(address, char);
			}
		}
	}

	public updateAll() : void {
		for(let address = SCREEN_START ; address < SCREEN_START + SCREEN_SIZE_BYTES ; ++address) {
			let char = this.readByte(address);
			this.updateByte(address, char);
		}
	}
}
