"use strict"

export default class TapeUnitMotorControl {

	private _motorOn = false;
	private _baud : number = 300;
	private _motorMask : number;

	constructor(motorMask : number) {
		this._motorMask = motorMask;
	}

	writeByte(data: number) : void {
		let motorOn = (this._motorMask & data) != 0;

		if(motorOn && !this._motorOn) {
			console.log('Tape motor on');
			this._baud = (data & 0x40) == 0 ? 300 : 1200;
		}
		else if(!motorOn && this._motorOn) {
			console.log('Tape motor off');
		}
		this._motorOn = motorOn;
	}

	get motorOn() : boolean {
		return this._motorOn;
	}

	get baud() : number {
		return this._baud;
	}
}

