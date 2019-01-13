'use strict';

import Tape from './ExidyTape';

export default class ArrayTape implements Tape {

    private _index = 0;
    private _data: Uint8Array;

    constructor(data: Uint8Array) {
        this._data = data;
    }

    readByte(baud: number): number {
        let d = this._data[this._index++];
        if (this._index > this._data.length) {
            this._index = 0;
        }
        return d;
    }

    writeByte(baud: number, data: number):  void {
      this._data[this._index++] = data;
    }
}

