'use strict';
import { SECTORS_PER_TRACK, NUMBER_OF_TRACKS, BYTES_PER_SECTOR } from './ExidyDiskConsts';
const ACTIVE_FOR_TICKS = 400;
export default class ExidyDiskDrive {
    constructor(unitNumber) {
        this._activeCount = 0;
        this._sectorNumber = 0;
        this._trackNumber = 0;
        this._newSector = false;
        this._disk = null;
        this._sectorIndex = 0;
        this._writeIndex = 0;
        this._unitNumber = unitNumber;
    }
    getUnitLetter() {
        return 'ABCD'.charAt(this._unitNumber);
    }
    set disk(disk) {
        this._disk = disk;
    }
    get disk() {
        return this._disk;
    }
    diskIn() {
        return this._disk != null;
    }
    dataReady() {
        return true;
    }
    home() {
        return this._trackNumber === 0;
    }
    stepForward() {
        if (this._trackNumber < (NUMBER_OF_TRACKS - 1)) {
            ++this._trackNumber;
        }
    }
    stepBackward() {
        if (this._trackNumber > 0) {
            --this._trackNumber;
        }
    }
    active() {
        return this._activeCount > 0;
    }
    activate() {
        if (this._activeCount === 0 && this._disk !== null) {
            this._disk.activate();
            this._activeCount = ACTIVE_FOR_TICKS;
        }
    }
    writeReg0(b) {
        switch (b) {
            case 0xA0:
                break;
            case 0x20:
            case 0x21:
                this.activate();
                break;
            case 0x60:
                this.stepBackward();
                break;
            case 0x61:
                this.stepForward();
                break;
        }
    }
    readyWrite() {
        this._writeIndex = 0;
    }
    writeReg1(b) {
        switch (b) {
            case 0xA0:
                break;
            case 0x20:
            case 0x21:
                this.activate();
                break;
            case 0x60:
                this.stepBackward();
                break;
            case 0x61:
                this.stepForward();
                break;
        }
    }
    writeReg2(b) {
        if (this.active()) {
            this._activeCount = ACTIVE_FOR_TICKS;
        }
        this._disk.write(this._trackNumber, this._sectorNumber, this._writeIndex++, b);
    }
    readReg0() {
        if (this.active()) {
            this._activeCount = ACTIVE_FOR_TICKS;
        }
        let r = this._sectorNumber;
        if (this._newSector) {
            r |= 0x80;
            this._newSector = false;
        }
        return r;
    }
    readReg1() {
        let r = 0;
        if (this.active())
            r |= 0x20;
        if (this.home())
            r |= 0x08;
        if (this.dataReady())
            r |= 0x80;
        return r;
    }
    readReg2() {
        if (this.active()) {
            this._activeCount = ACTIVE_FOR_TICKS;
        }
        if (this._disk != null) {
            if (this._sectorIndex < BYTES_PER_SECTOR) {
                let data = this._disk.read(this._trackNumber, this._sectorNumber, this._sectorIndex++);
                return data & 0xff;
            }
        }
        return 0;
    }
    tick() {
        if (this.active()) {
            this._sectorNumber++;
            this._sectorIndex = 0;
            if (this._sectorNumber >= SECTORS_PER_TRACK) {
                this._sectorNumber = 0;
            }
            this._newSector = true;
            this._activeCount--;
            if (!this.active()) {
                if (this._disk !== null) {
                    this._disk.deactivate();
                }
            }
        }
    }
}
