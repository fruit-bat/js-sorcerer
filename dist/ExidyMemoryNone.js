'use strict';
import MemoryType from './ExidyMemoryType';
export default class NoMemory {
    constructor() {
    }
    readByte(address) {
        return 0;
    }
    writeByte(address, data) {
    }
    memoryType() {
        return MemoryType.None;
    }
}
