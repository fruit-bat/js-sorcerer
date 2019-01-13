"use strict"

import Centronics from './ExidyCentronics'

export default class ElementPrinter implements Centronics {

	private _element : HTMLElement;
	private _rowElement : HTMLElement;
  private _oddEven : Boolean = false;
  private _autoScroll : Boolean = true;
  private _plain : string = '';

	private _encodeHTMLmap : any = {
		"&" : "&amp;",
		"'" : "&#39;",
		'"' : "&quot;",
		"<" : "&lt;",
		">" : "&gt;"
	};

  private _htmlUnescape(str : String) : String {
    return str
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
  }

	constructor(element : HTMLElement) {
    this._element = element;
		this.clear();
	}

	readByte() : number {
		return 0x7f;
	}

  private createHole() : HTMLElement {
    const hole = document.createElement('div');
    hole.className = 'hole';
    return hole;
  }

  private addRow() {
    const holeRowHole = document.createElement('div');
    holeRowHole.classList.add('row');
    this._rowElement = document.createElement('pre');
    holeRowHole.classList.add(this._oddEven ? 'odd' : 'even');
    holeRowHole.appendChild(this.createHole());
    holeRowHole.appendChild(this._rowElement);
    holeRowHole.appendChild(this.createHole());
    this._element.appendChild(holeRowHole);
    this._oddEven = !this._oddEven;
  }

  public clear() {
		this._element.innerHTML = '';
    this._plain = '';
    for(let i=0; i < 20; ++i) this.addRow();
  }

  public setAutoScroll(autoScroll : Boolean) {
    this._autoScroll = autoScroll;
  }

	private escape(char: string) : void {
		let r = this._encodeHTMLmap.char;
		return r ? r : char;
	}

	writeByte(data : number) : void {
		let clock = (data & 0x80) != 0;
		if(!clock) {
			let char = data & 0x7f;
      const c = String.fromCharCode(char);
      this._plain += c;
			if(char === 0x0a) return;
      if(char === 0x0d) {
        this.addRow();
        if(this._autoScroll) {
          this._element.scrollTop = this._element.scrollHeight;
        }
      }
      else {
        this._rowElement.innerHTML += this.escape(c);
      }
		}
	}

  getText() : string {
    return this._plain;
  }
}
