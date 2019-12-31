'use strict';

import Memory from './ExidyMemory';
import MemoryType from './ExidyMemoryType';

export default class MemoryTyped {
    private _memoryType: MemoryType;
    private _memory: Memory;

    public constructor(memory: Memory, memoryType: MemoryType) {
        this._memory = memory;
        this._memoryType = memoryType;
    }

    memoryType(): MemoryType {
        return this._memoryType;
    }

    memory() : Memory {
        return this._memory;
    }
}
