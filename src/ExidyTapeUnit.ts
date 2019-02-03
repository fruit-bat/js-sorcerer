'use strict';

import Tape from './ExidyTape';
import TapeUnitMotorControl from './ExidyTapeUnitMotorControl';
import Monostable from './ExidyMonostable';

export default class TapeUnit {

    private _motorControl: TapeUnitMotorControl;
    private _recordMonostable: Monostable;

    public tape: Tape;
    public recordListener: (running: boolean) => void = null;


    public constructor(motorControl: TapeUnitMotorControl) {
        this._motorControl = motorControl;
        this._recordMonostable = new Monostable(
            2000,
            recording => {
                if (this.recordListener) {
                    this.recordListener(recording);
                }
            }
        );
    }

    get readyForRead(): boolean {
        return this.tape && this._motorControl.motorOn;
    }

    get readyForWrite(): boolean {
        return this.tape && this._motorControl.motorOn;
    }

    set motorListener(listener: (running: boolean) => void) {
        this._motorControl.listener = listener;
    }

    get motorListener() : (running: boolean) => void {
        return this._motorControl.listener;
    }

    writeByte(data: number): void {
        this._recordMonostable.activate();
        if (this.readyForWrite) {
            this.tape.writeByte(this._motorControl.baud, data);
        }
    }

    readByte(): number {
        return this.readyForRead ? this.tape.readByte(this._motorControl.baud) : 0;
    }
}
