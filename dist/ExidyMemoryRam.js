'use strict';
export default class Ram {
    constructor(memory, memoryType) {
        this._memory = memory;
        this._memoryType = memoryType;
    }
    readByte(address) {
        return this._memory[address];
    }
    writeByte(address, data) {
        this._memory[address] = data;
    }
    memoryType() {
        return this._memoryType;
    }
}
