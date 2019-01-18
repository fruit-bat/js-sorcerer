'use strict';
export default class Keyboard {
    constructor() {
        this.activeScanLine = 0;
        this.line = new Array(16);
        this.line.fill(0xff);
    }
    readByte(address) {
        return this.line[this.activeScanLine];
    }
    writeByte(address, data) {
        this.activeScanLine = data & 0xf;
    }
    release(row, key) {
        this.line[row] |= 1 << key;
    }
    press(row, key) {
        this.line[row] &= ~(1 << key);
    }
}
