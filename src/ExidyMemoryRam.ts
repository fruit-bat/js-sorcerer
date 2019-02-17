'use strict';


import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';

export default class Ram implements MemoryTyped {

    private _memory: Uint8Array;
    private _memoryType: MemoryType;

    public constructor(memory: Uint8Array, memoryType: MemoryType) {
        this._memory = memory;
        this._memoryType = memoryType;
    }

    readByte(address: number): number {
        return this._memory[address];
    }

    writeByte(address: number, data: number): void {
        this._memory[address] = data;
    }

    memoryType(): MemoryType {
      return this._memoryType;
    }
}
