'use strict';
export default class TapeUnit {
    constructor(motorControl) {
        this._motorControl = motorControl;
    }
    get readyForRead() {
        return this.tape && this._motorControl.motorOn;
    }
    get readyForWrite() {
        return this.tape && this._motorControl.motorOn;
    }
    writeByte(data) {
        if (this.readyForWrite) {
            this.tape.writeByte(this._motorControl.baud, data);
        }
    }
    readByte() {
        return this.readyForRead ? this.tape.readByte(this._motorControl.baud) : 0;
    }
}
