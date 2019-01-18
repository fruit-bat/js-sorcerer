'use strict';
export default class Rom {
    constructor(memory) {
        this.memory = memory;
    }
    readByte(address) {
        return this.memory[address];
    }
    ;
    writeByte(address, data) {
    }
    ;
}
