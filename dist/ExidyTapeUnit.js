'use strict';
import Monostable from './ExidyMonostable';
export default class TapeUnit {
    constructor(motorControl) {
        this.recordListener = null;
        this._motorControl = motorControl;
        this._recordMonostable = new Monostable(2000, recording => {
            if (this.recordListener) {
                this.recordListener(recording);
            }
        });
    }
    get readyForRead() {
        return this.tape && this._motorControl.motorOn;
    }
    get readyForWrite() {
        return this.tape && this._motorControl.motorOn;
    }
    set motorListener(listener) {
        this._motorControl.listener = listener;
    }
    get motorListener() {
        return this._motorControl.listener;
    }
    writeByte(data) {
        this._recordMonostable.activate();
        if (this.readyForWrite) {
            this.tape.writeByte(this._motorControl.baud, data);
        }
    }
    readByte() {
        return this.readyForRead ? this.tape.readByte(this._motorControl.baud) : 0;
    }
}
