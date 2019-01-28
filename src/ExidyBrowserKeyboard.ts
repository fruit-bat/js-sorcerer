'use strict';

import Keyboard from './ExidyKeyboard';

const KEYCODE_TO_KEYID = {
    8: 'BACK SPACE', // Backspace
    9: 'Tab', // Tab
    13: 'ENTER', // Enter
    16: 'SHIFT', // Shift
    17: 'CTRL', // Control
    27: 'ESC', // Escape
    32: 'SPACE', //
    36: 'Unknown3', // Home
    37: 'NUM_4', // left
    38: 'NUM_8', // up
    39: 'NUM_6', // right
    40: 'NUM_2', // down
    46: 'Delete', // Delete
    48: '0', // 0
    49: '1', // 1
    50: '2', // 2
    51: '3', // 3
    52: '4', // 4
    53: '5', // 5
    54: '6', // 6
    55: '7', // 7
    56: '8', // 8
    57: '9', // 9
    59: ';', // ;
    65: 'A', // a, A
    66: 'B', // b, B
    67: 'C', // c, C
    68: 'D', // d, D
    69: 'E', // e, E
    70: 'F', // f, F
    71: 'G', // g, G
    72: 'H', // h, H
    73: 'I', // i, I
    74: 'J', // j, J
    75: 'K', // k, K
    76: 'L', // l, L
    77: 'M', // m, M
    78: 'N', // n, N
    79: 'O', // o, O
    80: 'P', // p, P
    81: 'Q', // q, Q
    82: 'R', // r, R
    83: 'S', // s, S
    84: 'T', // t, T
    85: 'U', // u, U
    86: 'V', // v, V
    87: 'W', // w, W
    88: 'X', // x, X
    89: 'Y', // y, Y
    90: 'Z', // z, Z
    96: 'NUM_0', // 0
    97: 'NUM_1', // 1
    98: 'NUM_2', // 2
    99: 'NUM_3', // 3
    100: 'NUM_4', // 4
    101: 'NUM_5', // 5
    102: 'NUM_6', // 6
    103: 'NUM_7', // 7
    104: 'NUM_8', // 8
    105: 'NUM_9', // 9
    106: 'NUM_*', // *
    107: 'NUM_+', // +
    109: 'NUM_-', // -
    110: 'NUM_.', // .
    111: 'NUM_/', // /
    112: 'Graphics', // F1
    115: 'Unknown1', // F4
    116: 'Unknown2', // F5
    117: 'Clear', // F6
    119: 'Repeat', // F8
    163: '^', // ^
    173: '-', // -
    186: ';', // ;
    187: '^', // =
    188: ',', // ,
    189: '-', // -
    190: '.', // .
    191: '/', // /
    192: '@', // '
    219: '[', // ]
    220: 'Backslash', // backslash
    221: ']', // ]
    222: ':' // #
};

export default class BrowserKeyboard {

    private _keyboard: Keyboard;

    public constructor(keyboard: Keyboard) {
        this._keyboard = keyboard;
    }

    public browserKeyUp(key: number): void {
        const keyId = KEYCODE_TO_KEYID[key];
        if (keyId) {
            this._keyboard.releaseKey(keyId);
        }
    }

    public browserKeyDown(key: number): void {
        const keyId = KEYCODE_TO_KEYID[key];
        if (keyId) {
            this._keyboard.pressKey(keyId);
        }
    }
}
