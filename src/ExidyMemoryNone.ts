'use strict';

import MemoryTyped from './ExidyMemoryTyped';
import MemoryType from './ExidyMemoryType';

export default class NoMemory implements MemoryTyped {

    public constructor() {
    }

    readByte(address: number): number {
        return 0;
    }

    writeByte(address: number, data: number): void {
    }

    memoryType(): MemoryType {
      return MemoryType.None;
    }
}
