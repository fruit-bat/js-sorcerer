"use strict"

import Centronics from './ExidyCentronics'

export default class ElementPrinter implements Centronics {

	private _element : HTMLElement;

    private _encodeHTMLmap : any = {
        "&" : "&amp;",
        "'" : "&#39;",
        '"' : "&quot;",
        "<" : "&lt;",
        ">" : "&gt;"
    };

	constructor(element : HTMLElement) {
		this._element = element;
	}

	readByte() : number {
		return 0x7f;
	}

	private escape(char: string) {
		let r = this._encodeHTMLmap.char;
		return r ? r : char;
	}

	writeByte(data : number) : void {
		let clock = (data & 0x80) != 0;
		if(!clock) {
			let char = data & 0x7f;
			if(char == 0x0a) return;
			this._element.innerHTML += this.escape(String.fromCharCode(char));
		}
	}
}
