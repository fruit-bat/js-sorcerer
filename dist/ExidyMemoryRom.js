'use strict';
export default class Rom {
    constructor(memory) {
        this._memory = memory;
    }
    readByte(address) {
        return this._memory[address];
    }
    writeByte(address, data) {
    }
}
