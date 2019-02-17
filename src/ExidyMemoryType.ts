'use strict';

export default class ExidyMemoryRegionType {
    private _code : number;
    private _description: string;
    private _start: number;
    private _length: number;

    public constructor(code: number, description: string, start: number, end: number) {
        this._code = code;
        this._description = description;
        this._start = start;
        this._length = end - start + 1;
    }

    get code(): number {
        return this._code;
    }

    get description(): string {
        return this._description;
    }

    get start(): number {
        return this._start;
    }

    get length(): number {
        return this._length;
    }
}

