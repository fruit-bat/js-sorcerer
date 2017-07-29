"use strict"

import Memory from './ExidyMemory';
import NoMemory from './ExidyMemoryNone';
import {MEMORY_SIZE_IN_BYTES, CHARS_START, CHARS_SIZE_BYTES, SCREEN_START, SCREEN_SIZE_BYTES} from './ExidyMemory';
import Ram from './ExidyMemoryRam';
import Rom from './ExidyMemoryRom';
import ExidyCharacters from './ExidyCharacters';
import ExidyScreen from './ExidyScreen';

class Multiplexor implements Memory {

	private handlers = new Array<Memory>(MEMORY_SIZE_IN_BYTES);

	public constructor() {
		this.handlers.fill(new NoMemory());
	}

	readByte(address: number): number {
		return this.handlers[address].readByte(address);
	}

	writeByte(address: number, data: number) : void {
		this.handlers[address].writeByte(address, data);
	}

	public setHandler(address : number, length : number, handler : Memory) : void {
		this.handlers.fill(handler, address, address + length);
	}
}

export default class MemorySystem {

	private _memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);

	private ram = new Ram(this._memory);
	private rom = new Rom(this._memory);

	private multplexor = new Multiplexor();

	private exidyCharacters : ExidyCharacters;
	private exidyScreen : ExidyScreen;

	public constructor()
	{
		this.multplexor.setHandler(0, MEMORY_SIZE_IN_BYTES, this.ram);

		this.multplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);

		const charsCanvas = <HTMLCanvasElement>document.createElement('canvas');
    charsCanvas.width = 2048;
    charsCanvas.height = 8;

		this.exidyScreen = new ExidyScreen(this._memory, charsCanvas);
		this.exidyCharacters = new ExidyCharacters(this._memory, charsCanvas, (char) => {
			this.exidyScreen.charUpdated(char);
		});

		this.multplexor.setHandler(SCREEN_START, SCREEN_SIZE_BYTES, this.exidyScreen);
		this.multplexor.setHandler(CHARS_START, CHARS_SIZE_BYTES, this.exidyCharacters);
	}

	public get screenCanvas() : HTMLCanvasElement {
		return this.exidyScreen.canvas;
	}

	public load(data : Uint8Array, address : number, start : number = 0) : void {
		this._memory.set(data.subarray(start), address);
	}

	public loadRom(data : Uint8Array, address : number) : void {
		this._memory.set(data, address);
		this.multplexor.setHandler(address, data.length, this.rom);
	}

	public get memory() : Memory {
		return this.multplexor;
	}

	public updateCharacters() : void {
		this.exidyCharacters.updateAll();
	}

	public updateScreen() : void {
		this.exidyScreen.updateAll();
	}

	public setHandler(address : number, length : number, handler : Memory) : void {
		this.multplexor.setHandler(address, length, handler);
	}
}
