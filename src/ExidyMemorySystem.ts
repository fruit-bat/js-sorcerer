"use strict"

import Memory from './ExidyMemory'

// TODO Split into separate files

export class Ram implements Memory {

	private memory : Uint8Array;

	public constructor(memory : Uint8Array) {
		this.memory = memory;
	}

	readByte(address: number): number {
		return this.memory[address];
	};

	writeByte(address: number, data: number) : void {
		this.memory[address] = data;
	};
}

export class Rom implements Memory {

	private memory : Uint8Array;

	public constructor(memory : Uint8Array) {
		this.memory = memory;
	}

	readByte(address: number): number {
		return this.memory[address];
	};

	writeByte(address: number, data: number) : void {
	};
}

export class NoMemory implements Memory {

	public constructor() {
	}

	readByte(address: number): number {
		return 0;
	}

	writeByte(address: number, data: number) : void {
	}
}

const MEMORY_SIZE_IN_BYTES = 65536;

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


const CHARS_START = 0xF800;
const CHARS_SIZE_BYTES = 8 * 256;


class ExidyCharacters extends Ram {

	private charsCanvas : HTMLCanvasElement;
	private charsCtx : CanvasRenderingContext2D;
	private byteCanvas : HTMLCanvasElement;
	private byteCtx : CanvasRenderingContext2D;
	private charUpdated : (char: number) => void;

	public constructor(
		memory : Uint8Array,
		byteCanvas : HTMLCanvasElement,
		charsCanvas : HTMLCanvasElement,
		charUpdated : (char: number) => void)
	{
		super(memory);
		this.charsCanvas = charsCanvas;
		this.byteCanvas = byteCanvas;
		this.byteCtx = byteCanvas.getContext("2d");
		this.charsCtx = charsCanvas.getContext("2d");
		this.charUpdated = charUpdated;

		for(let i = 0; i < 256; ++i) {
			let j = i;
			for(let x = 0; x < 8; ++x) {
				this.byteCtx.fillStyle = ((j & 0x80) === 0x80) ? "white" : "black";
				this.byteCtx.fillRect(x, i, 1, 1);
				j <<= 1;
			}
		}
	}

	writeByte(address: number, data: number) : void {
		if(address >= 0xFC00 && (data !== this.readByte(address))) {
			super.writeByte(address, data);
			this.charUpdated(this.updateByte(address, data));
		}
	}

	private updateByte(address: number, data: number) : number {
		let offset = address - CHARS_START;
		let row = offset & 0x7;
		let char = offset >> 3;
		this.charsCtx.drawImage(this.byteCanvas, 0, data, 8, 1, char << 3, row, 8, 1);
		return char;
	}

	public updateAll() : void {
		for(let i = 0; i < (256 << 3); ++i) {
			let data = this.readByte(CHARS_START + i);
			this.updateByte(CHARS_START + i, data);
		}
	}
}

const SCREEN_START = 0xF080;
const SCREEN_WIDTH = 64;
const SCREEN_HEIGHT = 30;
const SCREEN_SIZE_CHARS = SCREEN_WIDTH * SCREEN_HEIGHT;
const SCREEN_SIZE_BYTES = SCREEN_SIZE_CHARS;

class ExidyScreen extends Ram {

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

export default class MemorySystem {

	private _memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);

	private ram = new Ram(this._memory);
	private rom = new Rom(this._memory);

	private multplexor = new Multiplexor();

	private exidyCharacters : ExidyCharacters;
	private exidyScreen : ExidyScreen;

	public constructor(
		byteCanvas : HTMLCanvasElement,
		charsCanvas : HTMLCanvasElement,
		screenCanvas : HTMLCanvasElement)
	{
		this.multplexor.setHandler(0, MEMORY_SIZE_IN_BYTES, this.ram);

		this.multplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);

		this.exidyScreen = new ExidyScreen(this._memory, charsCanvas, screenCanvas);
		this.exidyCharacters = new ExidyCharacters(this._memory, byteCanvas, charsCanvas, (char) => {
			this.exidyScreen.charUpdated(char);
		});
		this.multplexor.setHandler(SCREEN_START, SCREEN_SIZE_BYTES, this.exidyScreen);
		this.multplexor.setHandler(CHARS_START, CHARS_SIZE_BYTES, this.exidyCharacters);
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
