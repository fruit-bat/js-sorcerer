'use strict';

import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';

export default class Rom implements MemoryTyped {

    private memory: Uint8Array;

    public constructor(memory: Uint8Array) {
        this.memory = memory;
    }

    readByte(address: number): number {
        return this.memory[address];
    }

    writeByte(address: number, data: number): void {
    }

    memoryType(): MemoryType {
      return MemoryType.Rom;
    }
}
