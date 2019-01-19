'use strict';

import Input from './ExidyInput';
import Output from './ExidyOutput';
import ExidyKey from './ExidyKey';

export default class Keyboard implements Input, Output {

    private activeScanLine = 0;
    private line = new Array<number>(16);
    private _keymap: Map<string, ExidyKey>;

    public listener: (keyId: string, pressed: boolean) => void = null;

    public constructor() {
        this.line.fill(0xff);

        const keyArray = [
            new ExidyKey('BACK SPACE', 11, 0),
            new ExidyKey('Tab', 1, 3),
            new ExidyKey('ENTER', 11, 1),
            new ExidyKey('SHIFT', 0, 4),
            new ExidyKey('CTRL', 0, 2),
            new ExidyKey('SHIFT LOCK', 0, 3),
            new ExidyKey('ESC', 0, 0),
            new ExidyKey('SPACE', 1, 2),
            new ExidyKey('unknown3', 1, 4),
            new ExidyKey('Delete', 15, 0),
            new ExidyKey('0', 9, 4),
            new ExidyKey('1', 2, 4),
            new ExidyKey('2', 3, 4),
            new ExidyKey('3', 4, 4),
            new ExidyKey('4', 4, 3),
            new ExidyKey('5', 5, 4),
            new ExidyKey('6', 6, 4),
            new ExidyKey('7', 7, 4),
            new ExidyKey('8', 8, 4),
            new ExidyKey('9', 8, 3),
            new ExidyKey(';', 9, 2),
            new ExidyKey('A', 2, 2),
            new ExidyKey('B', 5, 0),
            new ExidyKey('C', 3, 0),
            new ExidyKey('D', 3, 1),
            new ExidyKey('E', 4, 2),
            new ExidyKey('F', 4, 0),
            new ExidyKey('G', 5, 2),
            new ExidyKey('H', 6, 2),
            new ExidyKey('I', 7, 1),
            new ExidyKey('J', 7, 2),
            new ExidyKey('K', 7, 0),
            new ExidyKey('L', 8, 1),
            new ExidyKey('M', 6, 0),
            new ExidyKey('N', 6, 1),
            new ExidyKey('O', 8, 2),
            new ExidyKey('P', 9, 3),
            new ExidyKey('Q', 2, 3),
            new ExidyKey('R', 4, 1),
            new ExidyKey('S', 3, 2),
            new ExidyKey('T', 5, 3),
            new ExidyKey('U', 7, 3),
            new ExidyKey('V', 5, 1),
            new ExidyKey('W', 3, 3),
            new ExidyKey('X', 2, 0),
            new ExidyKey('Y', 6, 3),
            new ExidyKey('Z', 2, 1),
            new ExidyKey('Graphics', 0, 1),
            new ExidyKey('Clear', 1, 0),
            new ExidyKey('Repeat', 1, 1),
            new ExidyKey('^', 11, 3),
            new ExidyKey('-', 11, 4),
            new ExidyKey(',', 8, 0),
            new ExidyKey('.', 9, 1),
            new ExidyKey('/', 9, 0),
            new ExidyKey('[', 10, 3),
            new ExidyKey(']', 10, 2),
            new ExidyKey('Backslash', 10, 0),
            new ExidyKey('@', 10, 1),
            new ExidyKey(':', 10, 4),
            new ExidyKey('NUM_0', 13, 0),
            new ExidyKey('NUM_1', 13, 1),
            new ExidyKey('NUM_2', 14, 1),
            new ExidyKey('NUM_3', 15, 4),
            new ExidyKey('NUM_4', 13, 2),
            new ExidyKey('NUM_5', 14, 2),
            new ExidyKey('NUM_6', 14, 3),
            new ExidyKey('NUM_7', 13, 4),
            new ExidyKey('NUM_8', 13, 3),
            new ExidyKey('NUM_9', 14, 4),
            new ExidyKey('NUM_*', 12, 1),
            new ExidyKey('NUM_+', 12, 0),
            new ExidyKey('NUM_-', 12, 3),
            new ExidyKey('NUM_/', 12, 2),
            new ExidyKey('NUM_.', 14, 0),
            new ExidyKey('Unknown1', 15, 1),
            new ExidyKey('Unknown2', 15, 2),
            new ExidyKey('LINE FEED', 11, 2),
            new ExidyKey('NUM_=', 15, 3)
        ];

        this._keymap = keyArray.reduce((m, k) => {
            m[k.id] = k;
            return m;
        }, new Map<string, ExidyKey>());
    }

    readByte(address: number): number {
        return this.line[this.activeScanLine];
    }

    writeByte(address: number, data: number): void {
        this.activeScanLine = data & 0xf;
    }

    private release(row: number, key: number): void {
        this.line[row] |= 1 << key;
    }

    private press(row: number, key: number): void {
        this.line[row] &= ~(1 << key);
    }

    private isPressed(row: number, key: number): boolean {
        return ((~(this.line[row])) & (1 << key)) !== 0x00;
    }

    public pressKey(keyId: string): void {
        const key = this._keymap[keyId];
        if (!this.isPressed(key.row, key.col)) {
            console.log('pressing ' + key.row + ' ' + key.col);
            this.press(key.row, key.col);
            if (this.listener) this.listener(key.id, true);
        }
    }

    public releaseKey(keyId: string): void {
        const key = this._keymap[keyId];
        if (this.isPressed(key.row, key.col)) {
            this.release(key.row, key.col);
            if (this.listener) this.listener(key.id, false);
        }
    }
}
