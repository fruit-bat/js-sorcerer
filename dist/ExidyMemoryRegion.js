'use strict';
export default class ExidyMemoryRegion {
    constructor(memoryType, start, length) {
        this._memoryType = memoryType;
        this._start = start;
        this._length = length;
    }
    get start() {
        return this._start;
    }
    get length() {
        return this._length;
    }
    get memoryType() {
        return this._memoryType;
    }
    hex(num, len) {
        const str = num.toString(16);
        return "0".repeat(len - str.length) + str;
    }
    get text() {
        return this.hex(this._start, 4) + ' - ' +
            this.hex(this._start + this._length - 1, 4) + ' ' +
            this._memoryType.description;
    }
}
