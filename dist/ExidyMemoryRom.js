'use strict';
export default class Rom {
    constructor(memory, memoryType) {
        this._memory = memory;
        this._memoryType = memoryType;
    }
    readByte(address) {
        return this._memory[address];
    }
    writeByte(address, data) {
    }
    memoryType() {
        return this._memoryType;
    }
}
