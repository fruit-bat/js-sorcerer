'use strict';
export default class ArrayTape {
    constructor(data) {
        this._index = 0;
        this._data = data;
    }
    readByte(baud) {
        let d = this._data[this._index++];
        if (this._index > this._data.length) {
            this._index = 0;
        }
        return d;
    }
    writeByte(baud, data) {
        this._data[this._index++] = data;
    }
}
