"use strict"

import Input from './ExidyInput';
import Output from './ExidyOutput';
import Keyboard from './ExidyKeyboard'

class NoInput implements Input {
	readByte(address: number) : number {
		return 255;
	}
}

class NoOutput implements Output {
	writeByte(address: number, data: number) : void {
	}
}

class InputMultiplexor implements Input {

	private handlers = new Array<Input>(256);

	public constructor() {
		this.handlers.fill(new NoInput());
	}

	public readByte(address: number): number {
		return this.handlers[address & 0xFF].readByte(address);
	}

	public setHandler(address : number, length : number, handler : Input) : void {
		for(let i = 0; i < length; ++i) {
			this.handlers[address + i] = handler;
		}
	}
}

class OutputMultiplexor implements Output {

	private handlers = new Array<Output>(256);

	public constructor() {
		this.handlers.fill(new NoOutput());
	}

	public writeByte(address: number, data: number) : void {
		this.handlers[address & 0xFF].writeByte(address, data);
	}

	public setHandler(address : number, length : number, handler : Output) : void {
		for(let i = 0; i < length; ++i) {
			this.handlers[address + i] = handler;
		}
	}
}

export class IoSystem {

	private _input = new InputMultiplexor();
	private _output = new OutputMultiplexor();

	public constructor(keyboard : Keyboard) {
		this._output.setHandler(0xFE, 1, keyboard);
		this._input.setHandler(0xFE, 1, keyboard);
	}

	get output() : Output {
		return this._output;
	}

	get input() : Input {
		return this._input;
	}
}
