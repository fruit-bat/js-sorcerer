'use strict';

import Memory from './ExidyMemory';
import MemoryType from './ExidyMemoryType';

export default interface MemoryTyped extends Memory {
    memoryType() : MemoryType;
}
