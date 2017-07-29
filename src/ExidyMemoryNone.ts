"use strict"

import Memory from './ExidyMemory'

export default class NoMemory implements Memory {

	public constructor() {
	}

	readByte(address: number): number {
		return 0;
	}

	writeByte(address: number, data: number) : void {
	}
}
