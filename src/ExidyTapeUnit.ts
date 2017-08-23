'use strict';

import Tape from './ExidyTape';
import TapeUnitMotorControl from './ExidyTapeUnitMotorControl';

export default class TapeUnit {

    private _motorControl: TapeUnitMotorControl;

    public tape: Tape;

    public constructor(motorControl: TapeUnitMotorControl) {
        this._motorControl = motorControl;
    }

    get readyForRead(): boolean {
        return this.tape && this._motorControl.motorOn;
    }

    get readyForWrite(): boolean {
        return this.tape && this._motorControl.motorOn;
    }

    writeByte(data: number): void {
        if (this.readyForWrite) {
            this.tape.writeByte(this._motorControl.baud, data);
        }
    }

    readByte(): number {
        return this.readyForRead ? this.tape.readByte(this._motorControl.baud) : 0;
    }
}
