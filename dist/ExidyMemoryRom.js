'use strict';
import MemoryType from './ExidyMemoryType';
export default class Rom {
    constructor(memory) {
        this.memory = memory;
    }
    readByte(address) {
        return this.memory[address];
    }
    writeByte(address, data) {
    }
    memoryType() {
        return MemoryType.Rom;
    }
}
