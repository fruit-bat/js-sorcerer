'use strict';
export default class MemoryTyped {
    constructor(memory, memoryType) {
        this._memory = memory;
        this._memoryType = memoryType;
    }
    memoryType() {
        return this._memoryType;
    }
    memory() {
        return this._memory;
    }
}
