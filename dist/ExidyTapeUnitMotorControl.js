'use strict';
export default class TapeUnitMotorControl {
    constructor(motorMask) {
        this._motorOn = false;
        this._baud = 300;
        this.listener = null;
        this._motorMask = motorMask;
    }
    writeByte(data) {
        let motorOn = (this._motorMask & data) !== 0;
        if (motorOn && !this._motorOn) {
            if (this.listener)
                this.listener(true);
            this._baud = (data & 0x40) === 0 ? 300 : 1200;
        }
        else if (!motorOn && this._motorOn) {
            if (this.listener)
                this.listener(false);
        }
        this._motorOn = motorOn;
    }
    get motorOn() {
        return this._motorOn;
    }
    get baud() {
        return this._baud;
    }
}
