'use strict';

import Input from './ExidyInput';
import Output from './ExidyOutput';
import TapeUnit from './ExidyTapeUnit';
import TapeUnitMotorControl from './ExidyTapeUnitMotorControl';


class TapeSystemStatus implements Input {

    private _tapeUnits: Array<TapeUnit>;

    constructor(tapeUnits: Array<TapeUnit>) {
        this._tapeUnits = tapeUnits;
    }

    readByte(address: number): number {

        let status = 0xfc;

        //
        // This is the tape control line port
        //
        // Bit Function
        // ==================================
        // 0   Ready for input
        // 1   Ready for output
        //
        // Bits are active high
        //

        for (let i = 0; i < this._tapeUnits.length; ++i) {
            let tapeUnit = this._tapeUnits[i];
            if (tapeUnit.readyForRead) status |= 0x01;
            if (tapeUnit.readyForWrite) status |= 0x02;
        }

        return status;
    }
}

class TapeSystemData implements Input, Output {

    private _tapeUnits: Array<TapeUnit>;

    constructor(tapeUnits: Array<TapeUnit>) {
        this._tapeUnits = tapeUnits;
    }

    writeByte(address: number, data: number): void {
        for (let i = 0; i < this._tapeUnits.length; ++i) {
            let tapeUnit = this._tapeUnits[i];
            tapeUnit.writeByte(data);
        }
    }

    readByte(address: number): number {
        for (let i = 0; i < this._tapeUnits.length; ++i) {
            let tapeUnit = this._tapeUnits[i];
            if (tapeUnit.readyForRead) {
                return tapeUnit.readByte();
            }
        }
        return 0;
    }
}

class TapeSystemControl implements Output {

    private _tapeControls: Array<TapeUnitMotorControl>;

    constructor(tapeControls: Array<TapeUnitMotorControl>) {
        this._tapeControls = tapeControls;
    }

    writeByte(address: number, data: number): void {
        for (let i = 0; i < this._tapeControls.length; ++i) {
            let tapeControl = this._tapeControls[i];
            tapeControl.writeByte(data);
        }
    }
}

export default class TapeSystem {

    private _tapeControls: Array<TapeUnitMotorControl> = [
        new TapeUnitMotorControl(0x10),
        new TapeUnitMotorControl(0x20)
    ];

    private _tapeUnits: Array<TapeUnit> = this._tapeControls.map((tapeControl) => {
        return new TapeUnit(tapeControl);
    });

    private _tapeSystemStatus: TapeSystemStatus = new TapeSystemStatus(this._tapeUnits);

    private _tapeSystemControl: TapeSystemControl = new TapeSystemControl(this._tapeControls);

    private _tapeSystemData: TapeSystemData = new TapeSystemData(this._tapeUnits);

    public get status(): Input {
        return this._tapeSystemStatus;
    }

    public get dataOutput(): Output {
        return this._tapeSystemData;
    }

    public get dataInput(): Input {
        return this._tapeSystemData;
    }

    public get control(): Output {
        return this._tapeSystemControl;
    }

    public get units(): Array<TapeUnit> {
        return this._tapeUnits;
    }
}
