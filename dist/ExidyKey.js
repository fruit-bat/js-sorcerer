'use strict';
export default class ExidyKey {
    constructor(id, row, col) {
        this._id = id;
        this._row = row;
        this._col = col;
    }
    get id() {
        return this._id;
    }
    get row() {
        return this._row;
    }
    get col() {
        return this._col;
    }
}
