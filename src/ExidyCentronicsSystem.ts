"use strict"

import Input from './ExidyInput';
import Output from './ExidyOutput';
import Centronics from './ExidyCentronics'


export default class CentronicsSystem implements Input, Output {

	private _device : Centronics;

	set device(device : Centronics) {
		this._device = device;
	}

	readByte(address: number) : number {
		return this._device ? this._device.readByte() : 0xff;
	}

	writeByte(address: number, data: number) : void {
		if(this._device) this._device.writeByte(data);
	}
}

