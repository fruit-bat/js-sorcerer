'use strict';
import ExidyMemoryTypes from './ExidyMemoryTypes';
import Bytes from './ExidyBytes';
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
    static getSnp2Size() {
        return 5;
    }
    saveSnp2(data, address) {
        data[address] = this._memoryType.code;
        Bytes.set2ml(data, address + 1, this._start);
        Bytes.set2ml(data, address + 3, this._length);
        return ExidyMemoryRegion.getSnp2Size();
    }
    static loadSnp2(data, address) {
        const memoryTypeCode = data[address];
        const memoryType = ExidyMemoryTypes.getType(memoryTypeCode);
        const start = Bytes.get2ml(data, address + 1);
        const length = Bytes.get2ml(data, address + 3);
        return new ExidyMemoryRegion(memoryType, start, length);
    }
}
