'use strict';

import Memory from './ExidyMemory';

export default class Rom implements Memory {

    private _memory: Uint8Array;

    public constructor(memory: Uint8Array) {
        this._memory = memory;
    }

    readByte(address: number): number {
        return this._memory[address];
    }

    writeByte(address: number, data: number): void {
    }
}
