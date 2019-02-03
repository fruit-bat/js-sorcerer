'use strict';
import ExidyDiskDrive from './ExidyDiskDrive';
const MEM_DISK_REG_START = 0xBE00;
const MEM_DISK_REG_LEN = 128;
export default class ExidyDiskSystem {
    constructor(memorySystem) {
        this._drives = new Array(4);
        this._activeDrive = null;
        this._activeDriveNumber = 0x40;
        for (let i = 0; i < this._drives.length; ++i) {
            this._drives[i] = new ExidyDiskDrive(i);
        }
        memorySystem.setHandler(MEM_DISK_REG_START, MEM_DISK_REG_LEN, this);
    }
    getDiskDrive(drive) {
        return this._drives[drive];
    }
    insertDisk(disk, drive) {
        this._drives[drive].disk = disk;
    }
    dataReady() {
        return this._activeDrive === null ? false : this._activeDrive.dataReady();
    }
    home() {
        return this._activeDrive !== null ? this._activeDrive.home() : false;
    }
    stepForward() {
        if (this._activeDrive !== null) {
            this._activeDrive.stepForward();
        }
    }
    stepBackward() {
        if (this._activeDrive != null) {
            this._activeDrive.stepBackward();
        }
    }
    readyWrite() {
        if (this._activeDrive != null) {
            this._activeDrive.readyWrite();
        }
    }
    activate(drive) {
        this._activeDriveNumber = drive;
        this._activeDrive = this._drives[drive];
        this._activeDrive.activate();
    }
    active() {
        return this._activeDrive !== null;
    }
    writeReg0(b) {
        switch (b) {
            case 0xA0: break;
            case 0x20:
                this.activate(0);
                break;
            case 0x21:
                this.activate(1);
                break;
            case 0x22:
                this.activate(2);
                break;
            case 0x23:
                this.activate(3);
                break;
            case 0x60:
                this.stepBackward();
                break;
            case 0x61:
                this.stepForward();
                break;
            case 0x80:
                this.readyWrite();
                break;
        }
    }
    writeReg1(b) {
        switch (b) {
            case 0xA0: break;
            case 0x20:
                this.activate(0);
                break;
            case 0x21:
                this.activate(1);
                break;
            case 0x22:
                this.activate(2);
                break;
            case 0x23:
                this.activate(3);
                break;
            case 0x60:
                this.stepBackward();
                break;
            case 0x61:
                this.stepForward();
                break;
            case 0x80:
                this.readyWrite();
                break;
        }
    }
    writeReg2(b) {
        if (this._activeDrive != null) {
            this._activeDrive.writeReg2(b);
        }
    }
    readReg0() {
        return this._activeDrive !== null ? this._activeDrive.readReg0() : 0;
    }
    readReg1() {
        let r = this._activeDriveNumber;
        if (this.active())
            r |= 0x20;
        if (this.home())
            r |= 0x08;
        if (this.dataReady())
            r |= 0x80;
        return r;
    }
    readReg2() {
        return this._activeDrive === null ? 0 : this._activeDrive.readReg2();
    }
    writeByte(address, b) {
        switch (address - MEM_DISK_REG_START) {
            case 0:
                this.writeReg0(b);
                break;
            case 1:
                this.writeReg1(b);
                break;
            case 2:
                this.writeReg2(b);
                break;
        }
    }
    readByte(address) {
        switch (address - MEM_DISK_REG_START) {
            case 0: return this.readReg0();
            case 1: return this.readReg1();
            case 2: return this.readReg2();
        }
        return 0;
    }
    tick() {
        for (let i = 0; i < this._drives.length; ++i) {
            this._drives[i].tick();
        }
        if (this._activeDrive !== null) {
            if (this._activeDrive.active() === false) {
                this._activeDrive = null;
                this._activeDriveNumber = 0x40;
            }
        }
    }
}
