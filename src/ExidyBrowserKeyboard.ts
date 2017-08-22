"use strict"

import Keyboard from './ExidyKeyboard';

class KeyConfig {
	private _key : string;
	private _row : number;
	private _col : number;
	private _keyCode : number;
	private _keys : Array<string>;

	public constructor(
		key : string,
		row : number,
		col : number,
		keyCode : number,
		keys : Array<string>) {

		this._key = key;
		this._row = row;
		this._col = col;
		this._keyCode = keyCode;
		this._keys = keys;
	}

	public get row() {
		return this._row;
	}

	public get col() {
		return this._col;
	}

	public get keyCode() {
		return this._keyCode;
	}

	public get keys() {
		return this._keys;
	}
}

const KEY_CONFIG : Array<KeyConfig> = [

// TODO 0,3 shift lock
// TODO 11,2,"DOWN"
// TODO 15,3,"Numpad ="

	// row, col, keyCode, keys
	new KeyConfig('BACK SPACE', 11, 0, 8, ['Backspace'] ),
	new KeyConfig('Tab', 1, 3, 9, ['Tab'] ),
	new KeyConfig('ENTER', 11, 1, 13, ['Enter']),
	new KeyConfig('SHIFT', 0, 4, 16, ['Shift'] ),
	new KeyConfig('CTRL', 0, 2, 17, ['Control'] ),
	new KeyConfig('ESC', 0, 0, 27, ['Escape'] ),
	new KeyConfig('SPACE', 1, 2, 32, [' '] ),
	new KeyConfig('Unknown', 1, 4, 36, ['Home'] ),
	new KeyConfig('Delete', 15, 0, 46, ['Delete'] ),

	new KeyConfig('0', 9, 4, 48, ['0']),
	new KeyConfig('1', 2, 4, 49, ['1']),
	new KeyConfig('2', 3, 4, 50, ['2']),
	new KeyConfig('3', 4, 4, 51, ['3']),
	new KeyConfig('4', 4, 3, 52, ['4']),
	new KeyConfig('5', 5, 4, 53, ['5']),
	new KeyConfig('6', 6, 4, 54, ['6']),
	new KeyConfig('7', 7, 4, 55, ['7']),
	new KeyConfig('8', 8, 4, 56, ['8']),
	new KeyConfig('9', 8, 3, 57, ['9']),
	new KeyConfig(';', 9, 2, 59, [';']),

	new KeyConfig('A', 2, 2, 65, ['a', 'A']),
	new KeyConfig('B', 5, 0, 66, ['b', 'B']),
	new KeyConfig('C', 3, 0, 67, ['c', 'C']),
	new KeyConfig('D', 3, 1, 68, ['d', 'D']),
	new KeyConfig('E', 4, 2, 69, ['e', 'E']),
	new KeyConfig('F', 4, 0, 70, ['f', 'F']),
	new KeyConfig('G', 5, 2, 71, ['g', 'G']),
	new KeyConfig('H', 6, 2, 72, ['h', 'H']),
	new KeyConfig('I', 7, 1, 73, ['i', 'I']),
	new KeyConfig('J', 7, 2, 74, ['j', 'J']),
	new KeyConfig('K', 7, 0, 75, ['k', 'K']),
	new KeyConfig('L', 8, 1, 76, ['l', 'L']),
	new KeyConfig('M', 6, 0, 77, ['m', 'M']),
	new KeyConfig('N', 6, 1, 78, ['n', 'N']),
	new KeyConfig('O', 8, 2, 79, ['o', 'O']),
	new KeyConfig('P', 9, 3, 80, ['p', 'P']),
	new KeyConfig('Q', 2, 3, 81, ['q', 'Q']),
	new KeyConfig('R', 4, 1, 82, ['r', 'R']),
	new KeyConfig('S', 3, 2, 83, ['s', 'S']),
	new KeyConfig('T', 5, 3, 84, ['t', 'T']),
	new KeyConfig('U', 7, 3, 85, ['u', 'U']),
	new KeyConfig('V', 5, 1, 86, ['v', 'V']),
	new KeyConfig('W', 3, 3, 87, ['w', 'W']),
	new KeyConfig('X', 2, 0, 88, ['x', 'X'] ),
	new KeyConfig('Y', 6, 3, 89, ['y', 'Y'] ),
	new KeyConfig('Z', 2, 1, 90, ['z', 'Z'] ),

	new KeyConfig('Grapxhics', 0, 1, 112, ['F1'] ),
	new KeyConfig('Clear', 1, 0, 117, ['F6'] ),
	new KeyConfig('Repeat', 1, 1, 119, ['F8'] ),
	new KeyConfig('^', 11, 3, 163, ['^'] ), //^~
	new KeyConfig('-', 11, 4, 173, ['-'] ),
	new KeyConfig(',', 8, 0, 188, [','] ),
	new KeyConfig('.', 9, 1, 190, ['.'] ),
	new KeyConfig('/', 9, 0, 191, ['/'] ),

	new KeyConfig('[', 10, 3, 219, [']'] ),
	new KeyConfig('[', 10, 2, 221, [']'] ),
	new KeyConfig('Backslash', 10, 0, 220, ['\\'] ),
	new KeyConfig('@', 10, 1, 192, ['@'] ), //LF/`
	new KeyConfig('\'', 10, 4, 222, ['\''] ), //:*

	// Numpad (Currently with num-lock on!?);
	new KeyConfig('NUM_0', 13, 0, 96, ['0']),
	new KeyConfig('NUM_1', 13, 1, 97, ['1']),
	new KeyConfig('NUM_2', 14, 1, 98, ['2']),
	new KeyConfig('NUM_3', 15, 4, 99, ['3']),
	new KeyConfig('NUM_4', 13, 2, 100, ['4']),
	new KeyConfig('NUM_5', 14, 2, 101, ['5']),
	new KeyConfig('NUM_6', 14, 3, 102, ['6']),
	new KeyConfig('NUM_7', 13, 4, 103, ['7']),
	new KeyConfig('NUM_8', 13, 3, 104, ['8']),
	new KeyConfig('NUM_9', 14, 4, 105, ['9']),
	new KeyConfig('NUM_*', 12, 1, 106, ['*']),
	new KeyConfig('NUM_+', 12, 0, 107, ['+']),
	new KeyConfig('NUM_-', 12, 3, 109, ['-']),
	new KeyConfig('NUM_/', 12, 2, 111, ['/']),
	new KeyConfig('NUM_.', 14, 0, 110, ['.']),

	new KeyConfig('Unknown', 15, 1, 115, ['F4']),
	new KeyConfig('Unknown', 15, 2, 116, ['F5'])
];

export default class BrowserKeyboard extends Keyboard {

	private _keyCodeToConfig;
	private _keyboard : Keyboard;

	public constructor(keyboard: Keyboard) {
		super();

		this._keyboard = keyboard;

		this._keyCodeToConfig = KEY_CONFIG.reduce(
			(m, keyConfig) => {
				m[keyConfig.keyCode] = keyConfig;
				return m;
			},
			{}
		);
	}

	public browserKeyUp(key : number) : void {
		const mapping = this._keyCodeToConfig[key];
		if(mapping) {
			this._keyboard.release(mapping.row, mapping.col);
		}
	}

	public browserKeyDown(key : number) : void {
		const mapping = this._keyCodeToConfig[key];
		if(mapping) {
			this._keyboard.press(mapping.row, mapping.col);
		}
	}
}
