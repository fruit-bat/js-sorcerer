"use strict"

export default interface Centronics {
	readByte() : number;
	writeByte(data : number) : void;
}

