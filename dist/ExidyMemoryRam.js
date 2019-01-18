'use strict';
export default class Ram {
    constructor(memory) {
        this.memory = memory;
    }
    readByte(address) {
        return this.memory[address];
    }
    ;
    writeByte(address, data) {
        this.memory[address] = data;
    }
    ;
}
