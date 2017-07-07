"use strict"

import Keyboard from './ExidyKeyboard';

const keymap = {
	// return
	13 : { row : 11, key : 1 }
	// shift
	16 : { row : 0, key : 4 }
	// a
	65 : { row : 2, key : 2 }
	// 0
	48 : { row : 9, key : 4 }
	// 1
	49 : { row : 2, key : 4 }
};

export default class BrowserKeyboard extends Keyboard {

	public browserKeyUp(key : number) : void {
		if(key in keymap) {
			let mapping = keymap[key];
			this.release(mapping.row, mapping.key);
		}
	}

	public browserKeyDown(key : number) : void {
		if(key in keymap) {
			let mapping = keymap[key];
			this.press(mapping.row, mapping.key);
		}
	}
}
