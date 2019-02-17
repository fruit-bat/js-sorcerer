'use strict';

import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';
import MemoryTypes from './ExidyMemoryTypes';

export default class NoMemory implements MemoryTyped {

    public constructor() {
    }

    readByte(address: number): number {
        return 0;
    }

    writeByte(address: number, data: number): void {
    }

    memoryType(): MemoryType {
      return MemoryTypes.None;
    }
}
