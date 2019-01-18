'use strict';
import TapeUnit from './ExidyTapeUnit';
import TapeUnitMotorControl from './ExidyTapeUnitMotorControl';
class TapeSystemStatus {
    constructor(tapeUnits) {
        this._tapeUnits = tapeUnits;
    }
    readByte(address) {
        let status = 0xfc;
        for (let i = 0; i < this._tapeUnits.length; ++i) {
            let tapeUnit = this._tapeUnits[i];
            if (tapeUnit.readyForRead)
                status |= 0x01;
            if (tapeUnit.readyForWrite)
                status |= 0x02;
        }
        return status;
    }
}
class TapeSystemData {
    constructor(tapeUnits) {
        this._tapeUnits = tapeUnits;
    }
    writeByte(address, data) {
        for (let i = 0; i < this._tapeUnits.length; ++i) {
            let tapeUnit = this._tapeUnits[i];
            tapeUnit.writeByte(data);
        }
    }
    readByte(address) {
        for (let i = 0; i < this._tapeUnits.length; ++i) {
            let tapeUnit = this._tapeUnits[i];
            if (tapeUnit.readyForRead) {
                return tapeUnit.readByte();
            }
        }
        return 0;
    }
}
class TapeSystemControl {
    constructor(tapeControls) {
        this._tapeControls = tapeControls;
    }
    writeByte(address, data) {
        for (let i = 0; i < this._tapeControls.length; ++i) {
            let tapeControl = this._tapeControls[i];
            tapeControl.writeByte(data);
        }
    }
}
export default class TapeSystem {
    constructor() {
        this._tapeControls = [
            new TapeUnitMotorControl(0x10),
            new TapeUnitMotorControl(0x20)
        ];
        this._tapeUnits = this._tapeControls.map((tapeControl) => {
            return new TapeUnit(tapeControl);
        });
        this._tapeSystemStatus = new TapeSystemStatus(this._tapeUnits);
        this._tapeSystemControl = new TapeSystemControl(this._tapeControls);
        this._tapeSystemData = new TapeSystemData(this._tapeUnits);
    }
    get status() {
        return this._tapeSystemStatus;
    }
    get dataOutput() {
        return this._tapeSystemData;
    }
    get dataInput() {
        return this._tapeSystemData;
    }
    get control() {
        return this._tapeSystemControl;
    }
    get units() {
        return this._tapeUnits;
    }
    getUnit(unit) {
        return this._tapeUnits[unit];
    }
}
