"use strict";
export default class ElementPrinter {
    constructor(element) {
        this._oddEven = false;
        this._autoScroll = true;
        this._plain = '';
        this._encodeHTMLmap = {
            "&": "&amp;",
            "'": "&#39;",
            '"': "&quot;",
            "<": "&lt;",
            ">": "&gt;"
        };
        this._element = element;
        this.clear();
    }
    _htmlUnescape(str) {
        return str
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
    }
    readByte() {
        return 0x7f;
    }
    createHole() {
        const hole = document.createElement('div');
        hole.className = 'hole';
        return hole;
    }
    addRow() {
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
    clear() {
        this._element.innerHTML = '';
        this._plain = '';
        for (let i = 0; i < 20; ++i)
            this.addRow();
    }
    setAutoScroll(autoScroll) {
        this._autoScroll = autoScroll;
    }
    escape(char) {
        let r = this._encodeHTMLmap.char;
        return r ? r : char;
    }
    writeByte(data) {
        let clock = (data & 0x80) != 0;
        if (!clock) {
            let char = data & 0x7f;
            const c = String.fromCharCode(char);
            this._plain += c;
            if (char === 0x0a)
                return;
            if (char === 0x0d) {
                this.addRow();
                if (this._autoScroll) {
                    this._element.scrollTop = this._element.scrollHeight;
                }
            }
            else {
                this._rowElement.innerHTML += this.escape(c);
            }
        }
    }
    getText() {
        return this._plain;
    }
}
