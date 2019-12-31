'use strict';

import ExidyDisk from './ExidyDisk';
import ExidyDiskDrive from './ExidyDiskDrive';
import Memory from './ExidyMemory';
import MemorySystem from './ExidyMemorySystem';

const MEM_DISK_REG_START = 0xBE00;
const MEM_DISK_REG_LEN = 128;


export default class ExidyDiskSystem implements Memory {

    private _drives = new Array<ExidyDiskDrive>(4);
    private _activeDrive: ExidyDiskDrive = null;
    private _activeDriveNumber: number = 0x40;

    public constructor(memorySystem: MemorySystem) {
        for ( let i = 0; i < this._drives.length; ++i ) {
            this._drives[ i ] = new ExidyDiskDrive(i);
        }

        memorySystem.loadDiskSystem(this);
    }

    public getDiskDrive(drive: number): ExidyDiskDrive {
        return this._drives[ drive ];
    }

    public insertDisk(disk: ExidyDisk, drive: number): void {
        this._drives[ drive ].disk = disk;
    }

    private dataReady(): boolean {
        return this._activeDrive === null ? false : this._activeDrive.dataReady();
    }

    private home(): boolean {
        return this._activeDrive !== null ? this._activeDrive.home() : false;
    }

    private stepForward(): void {
        if ( this._activeDrive !== null ) {
            this._activeDrive.stepForward();
        }
    }

    private stepBackward(): void {
        if ( this._activeDrive != null ) {
            this._activeDrive.stepBackward();
        }
    }

    private readyWrite(): void {
        if ( this._activeDrive != null ) {
            this._activeDrive.readyWrite();
        }
    }

    private activate(drive: number): void {
        this._activeDriveNumber = drive;
        this._activeDrive = this._drives[ drive ];
        this._activeDrive.activate();
    }

    private active(): boolean {
        return this._activeDrive !== null;
    }

    private writeReg0(b: number ): void {
        switch ( b ) {
            case 0xA0: break;
            case 0x20: this.activate( 0 );    break;
            case 0x21: this.activate( 1 );    break;
            case 0x22: this.activate( 2 );    break;
            case 0x23: this.activate( 3 );    break;
            case 0x60: this.stepBackward(); break;
            case 0x61: this.stepForward();    break;
            case 0x80: this.readyWrite();     break;
        }
    }

    private writeReg1(b: number): void {
        switch ( b ) {
            case 0xA0: break;
            case 0x20: this.activate( 0 );    break;
            case 0x21: this.activate( 1 );    break;
            case 0x22: this.activate( 2 );    break;
            case 0x23: this.activate( 3 );    break;
            case 0x60: this.stepBackward(); break;
            case 0x61: this.stepForward();    break;
            case 0x80: this.readyWrite();     break;
        }
    }

    private writeReg2(b: number): void {
        if ( this._activeDrive != null ) {
            this._activeDrive.writeReg2( b );
        }
    }

    private readReg0(): number {
        return this._activeDrive !== null ? this._activeDrive.readReg0() : 0;
    }

    private readReg1(): number {
        let r = this._activeDriveNumber;

        if ( this.active() ) r |= 0x20;
        if ( this.home() ) r |= 0x08;
        if ( this.dataReady() ) r |= 0x80;

        return r;
    }

    private readReg2(): number {
        return this._activeDrive === null ? 0 : this._activeDrive.readReg2();
    }

    public writeByte(address: number, b: number): void {
        switch (address - MEM_DISK_REG_START) {
            case 0: this.writeReg0( b ); break;
            case 1: this.writeReg1( b ); break;
            case 2: this.writeReg2( b ); break;
        }
    }

    public readByte(address: number): number {
        switch (address - MEM_DISK_REG_START) {
            case 0: return this.readReg0();
            case 1: return this.readReg1();
            case 2: return this.readReg2();
        }
        return 0;
    }

    public tick(): void {
        for ( let i = 0; i < this._drives.length; ++i ) {
            this._drives[ i ].tick();
        }
        if (this._activeDrive !== null ) {
            if ( this._activeDrive.active() === false ) {
                this._activeDrive = null;
                this._activeDriveNumber = 0x40;
            }
        }
    }
}
