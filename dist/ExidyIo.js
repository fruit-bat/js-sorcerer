'use strict';
class NoInput {
    readByte(address) {
        return 255;
    }
}
class InputMultiplexor {
    constructor() {
        this.handlers = new Array(256);
        this.handlers.fill(new NoInput());
    }
    readByte(address) {
        return this.handlers[address & 0xFF].readByte(address);
    }
    setHandler(address, handler) {
        this.handlers[address] = handler;
    }
}
class OutputMultiplexor {
    constructor() {
        this.handlers = new Array(256);
        for (let i = 0; i < this.handlers.length; ++i) {
            this.handlers[i] = new Array();
        }
    }
    writeByte(address, data) {
        const handlersForPort = this.handlers[address & 0xFF];
        for (let i = 0; i < handlersForPort.length; ++i) {
            handlersForPort[i].writeByte(address, data);
        }
    }
    addHandler(address, handler) {
        const handlersForPort = this.handlers[address & 0xFF];
        handlersForPort.push(handler);
    }
}
export class IoSystem {
    constructor() {
        this._input = new InputMultiplexor();
        this._output = new OutputMultiplexor();
    }
    get output() {
        return this._output;
    }
    get input() {
        return this._input;
    }
}
