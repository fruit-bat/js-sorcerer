'use strict';

import ExidyDisk from './ExidyDisk';
import { SECTORS_PER_TRACK, NUMBER_OF_TRACKS, BYTES_PER_SECTOR } from './ExidyDiskConsts';
import Monostable from './ExidyMonostable';

const ACTIVE_FOR_TICKS = 400;

export default class ExidyDiskDrive {

    private _activeCount: number = 0;
    private _sectorNumber: number = 0;
    private _trackNumber: number = 0;
    private _newSector: boolean = false;
    private _disk: ExidyDisk = null;
    private _sectorIndex: number = 0;
    private _writeIndex: number = 0;
    private _unitNumber: number;
    private _writeMonostable: Monostable;

    public motorListener: (running: boolean) => void = null;
    public writeListener: (running: boolean) => void = null;

    public constructor(unitNumber: number) {
        this._unitNumber = unitNumber;
        this._writeMonostable = new Monostable(
            2000,
            writing => {
                if (this.writeListener) {
                    this.writeListener(writing);
                }
            }
        );
    }

    public getUnitLetter(): string {
        return 'ABCD'.charAt(this._unitNumber);
    }

    public set disk(disk: ExidyDisk) {
        this._disk = disk;
    }

    public get disk(): ExidyDisk {
        return this._disk;
    }

    public diskIn(): boolean {
        return this._disk != null;
    }

    public dataReady(): boolean {
        return true;
    }

    public home(): boolean {
        return this._trackNumber === 0;
    }

    public stepForward(): void {
        if ( this._trackNumber < ( NUMBER_OF_TRACKS - 1 ) ) {
            ++this._trackNumber;
        }
    }

    public stepBackward(): void {
        if ( this._trackNumber > 0 ) {
            --this._trackNumber;
        }
    }

    public active(): boolean {
        return this._activeCount > 0;
    }

    public activate(): void {
        if (this._activeCount === 0) {
            if (this.motorListener) this.motorListener(true);
            this._activeCount = ACTIVE_FOR_TICKS;
        }
    }

    private writeReg0(b: number): void {
        switch ( b ) {
        case 0xA0:
            break;
        case 0x20:
        case 0x21: // Disk b:
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

    public readyWrite(): void {
        this._writeIndex = 0;
    }

    private writeReg1(b: number): void {
        switch ( b ) {
        case 0xA0:
            break;
        case 0x20:
        case 0x21: // Disk b:
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

    public writeReg2(b: number): void {
        if ( this.active() ) {
            this._activeCount = ACTIVE_FOR_TICKS;
        }
        this._writeMonostable.activate();
        this._disk.write( this._trackNumber, this._sectorNumber, this._writeIndex++, b );
    }

    public readReg0(): number {
        if ( this.active() ) {
            this._activeCount = ACTIVE_FOR_TICKS;
        }
        let r = this._sectorNumber;
        if ( this._newSector ) {
            r |= 0x80;
            this._newSector = false;
        }
        return r;
    }

    private readReg1(): number {
        let r = 0;
        if ( this.active() ) r |= 0x20;
        if ( this.home() ) r |= 0x08;
        if ( this.dataReady() ) r |= 0x80;
        return r;
    }

    public readReg2(): number {
        if ( this.active() ) {
            this._activeCount = ACTIVE_FOR_TICKS;
        }
        if ( this._disk != null ) {
            if ( this._sectorIndex < BYTES_PER_SECTOR ) {
                let data = this._disk.read( this._trackNumber, this._sectorNumber, this._sectorIndex++ );
                return data & 0xff;
            }
        }
        return 0;
    }

    public tick(): void {
        if ( this.active() ) {
            this._sectorNumber++;
            this._sectorIndex = 0;

            if ( this._sectorNumber >= SECTORS_PER_TRACK ) {
                this._sectorNumber = 0;
            }
            this._newSector = true;

            this._activeCount--;

            if ( !this.active() ) {
                if (this.motorListener) this.motorListener(false);
            }
        }
    }
}
