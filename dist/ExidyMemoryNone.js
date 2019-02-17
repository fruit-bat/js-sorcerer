'use strict';
import MemoryTypes from './ExidyMemoryTypes';
export default class NoMemory {
    constructor() {
    }
    readByte(address) {
        return 0;
    }
    writeByte(address, data) {
    }
    memoryType() {
        return MemoryTypes.None;
    }
}
