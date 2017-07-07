"use strict"

import Input from './ExidyInput';
import Output from './ExidyOutput';

export default class Keyboard implements Input, Output {

	private activeScanLine = 0;
	private line = new Array<number>(16);

	public constructor() {
		this.line.fill(0xff);
	}

	readByte(address: number): number{
		return this.line[this.activeScanLine];
	}

	writeByte(address: number, data: number) : void {
		this.activeScanLine = data & 0xf;
	}

	public release(row: number, key: number) : void {
		this.line[row] |= 1 << key;
	}

	public press(row: number, key: number) : void {
		this.line[row] &= ~(1 << key);
	}
}
