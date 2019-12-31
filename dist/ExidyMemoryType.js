'use strict';
export default class ExidyMemoryRegionType {
    constructor(code, description, start, end) {
        this._code = code;
        this._description = description;
        this._start = start;
        this._length = end - start + 1;
    }
    get code() {
        return this._code;
    }
    get description() {
        return this._description;
    }
    get start() {
        return this._start;
    }
    get length() {
        return this._length;
    }
}
