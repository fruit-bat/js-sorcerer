'use strict';

import ExidyMemoryType from './ExidyMemoryType';

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
        this._memoryType;
    }
}
