'use strict';
export default class Ram {
    constructor(memory) {
        this._memory = memory;
    }
    readByte(address) {
        return this._memory[address];
    }
    writeByte(address, data) {
        this._memory[address] = data;
    }
}
