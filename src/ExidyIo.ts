"use strict"

import Input from './ExidyInput';
import Output from './ExidyOutput';

class NoInput implements Input {
	readByte(address: number) : number {
		return 255;
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

	public setHandler(address : number, handler : Input) : void {
		this.handlers[address] = handler;
	}
}

class OutputMultiplexor implements Output {

	private handlers = new Array<Array<Output>>(256);

	public constructor() {
		for(let i = 0; i < this.handlers.length; ++i) {
			this.handlers[i] = new Array<Output>();
		}
	}

	public writeByte(address: number, data: number) : void {
		let handlersForPort = this.handlers[address & 0xFF];
		for(let i = 0; i < handlersForPort.length; ++i) {
			handlersForPort[i].writeByte(address, data);
		}
	}

	public addHandler(address : number, handler : Output) : void {
		let handlersForPort = this.handlers[address & 0xFF];
		handlersForPort.push(handler);
	}
}

export class IoSystem {

	private _input = new InputMultiplexor();
	private _output = new OutputMultiplexor();

	get output() : OutputMultiplexor {
		return this._output;
	}

	get input() : InputMultiplexor {
		return this._input;
	}
}
