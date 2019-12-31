'use strict';

import ExidyMemoryType from './ExidyMemoryType';
import ExidyMemoryTypes from './ExidyMemoryTypes';
import Bytes from './ExidyBytes';

export default class ExidyMemoryRegion {

    private _memoryType: ExidyMemoryType;
    private _start: number;
    private _length: number;

    public constructor(
        memoryType: ExidyMemoryType,
        start: number,
        length: number) {

        this._memoryType = memoryType;
        this._start = start;
        this._length = length;
    }

    get start(): number {
        return this._start;
    }

    get length(): number {
        return this._length;
    }

    get memoryType(): ExidyMemoryType {
        return this._memoryType;
    }

    private hex(num, len) {
        const str = num.toString(16);
        return "0".repeat(len - str.length) + str;
    }

    get text(): string {
      return this.hex(this._start, 4) + ' - ' +
        this.hex(this._start + this._length - 1, 4) + ' ' +
        this._memoryType.description;
    }

    public static getSnp2Size(): number {
        return 5;
    }

    public saveSnp2(data: Uint8Array, address: number): number {
        data[address] = this._memoryType.code;
        Bytes.set2ml(data, address + 1, this._start);
        Bytes.set2ml(data, address + 3, this._length);
        return ExidyMemoryRegion.getSnp2Size();
    }

    public static loadSnp2(data: Uint8Array, address: number): ExidyMemoryRegion {
        const memoryTypeCode = data[address];
        const memoryType = ExidyMemoryTypes.getType(memoryTypeCode);
        const start = Bytes.get2ml(data, address + 1);
        const length = Bytes.get2ml(data, address + 3);
        return new ExidyMemoryRegion(memoryType, start, length);
    }
}
