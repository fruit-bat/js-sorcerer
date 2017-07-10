"use strict"

export default interface Tape {
	readByte(baud : number) : number;
	writeByte(baud : number, data : number) : void;
}

