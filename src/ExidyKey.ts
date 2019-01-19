'use strict';

export default class ExidyKey {
    private _id: string;
    private _row: number;
    private _col: number;

    public constructor(
        id: string,
        row: number,
        col: number,
    ) {
        this._id = id;
        this._row = row;
        this._col = col;
    }

    public get id() {
      return this._id;
    }

    public get row() {
        return this._row;
    }

    public get col() {
        return this._col;
    }
}
