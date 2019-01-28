'use strict';
const KEYCODE_TO_KEYID = {
    8: 'BACK SPACE',
    9: 'Tab',
    13: 'ENTER',
    16: 'SHIFT',
    17: 'CTRL',
    27: 'ESC',
    32: 'SPACE',
    36: 'Unknown3',
    37: 'NUM_4',
    38: 'NUM_8',
    39: 'NUM_6',
    40: 'NUM_2',
    46: 'Delete',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    59: ';',
    65: 'A',
    66: 'B',
    67: 'C',
    68: 'D',
    69: 'E',
    70: 'F',
    71: 'G',
    72: 'H',
    73: 'I',
    74: 'J',
    75: 'K',
    76: 'L',
    77: 'M',
    78: 'N',
    79: 'O',
    80: 'P',
    81: 'Q',
    82: 'R',
    83: 'S',
    84: 'T',
    85: 'U',
    86: 'V',
    87: 'W',
    88: 'X',
    89: 'Y',
    90: 'Z',
    96: 'NUM_0',
    97: 'NUM_1',
    98: 'NUM_2',
    99: 'NUM_3',
    100: 'NUM_4',
    101: 'NUM_5',
    102: 'NUM_6',
    103: 'NUM_7',
    104: 'NUM_8',
    105: 'NUM_9',
    106: 'NUM_*',
    107: 'NUM_+',
    109: 'NUM_-',
    110: 'NUM_.',
    111: 'NUM_/',
    112: 'Graphics',
    115: 'Unknown1',
    116: 'Unknown2',
    117: 'Clear',
    119: 'Repeat',
    163: '^',
    173: '-',
    186: ';',
    187: '^',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    192: '@',
    219: '[',
    220: 'Backslash',
    221: ']',
    222: ':'
};
export default class BrowserKeyboard {
    constructor(keyboard) {
        this._keyboard = keyboard;
    }
    browserKeyUp(key) {
        const keyId = KEYCODE_TO_KEYID[key];
        if (keyId) {
            this._keyboard.releaseKey(keyId);
        }
    }
    browserKeyDown(key) {
        const keyId = KEYCODE_TO_KEYID[key];
        if (keyId) {
            this._keyboard.pressKey(keyId);
        }
    }
}
