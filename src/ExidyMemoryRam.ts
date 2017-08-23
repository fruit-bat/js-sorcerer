'use strict';

import Memory from './ExidyMemory';

export default class Ram implements Memory {

    private memory: Uint8Array;

    public constructor(memory: Uint8Array) {
        this.memory = memory;
    }

    readByte(address: number): number {
        return this.memory[address];
    };

    writeByte(address: number, data: number): void {
        this.memory[address] = data;
    };
}
