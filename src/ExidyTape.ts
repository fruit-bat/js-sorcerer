"use strict"

import Input from './ExidyInput';
import Output from './ExidyOutput';

export default interface Tape {
	readByte(baud : number) : number;
	writeByte(baud : number, data : number) : void;
}

