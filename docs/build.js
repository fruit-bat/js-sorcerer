define("BinaryAjax", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BinaryAjax {
        static read(url) {
            return new Promise((resolve, reject) => {
                let xmlHTTP = new XMLHttpRequest();
                xmlHTTP.open('GET', url, true);
                xmlHTTP.responseType = 'arraybuffer';
                xmlHTTP.onload = function (e) {
                    resolve(new Uint8Array(xmlHTTP.response));
                };
                xmlHTTP.send();
            });
        }
    }
    exports.default = BinaryAjax;
});
define("DropZone", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DropZone {
        stopEvent(e) {
            e.stopPropagation();
            e.preventDefault();
        }
        handleDragOver(e) {
            this.stopEvent(e);
        }
        handleDragEnter(e) {
            this.stopEvent(e);
        }
        handleFiles(files) {
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let reader = new FileReader();
                reader.onload = (e) => {
                    this.handler(reader.result);
                };
                reader.readAsArrayBuffer(file);
            }
        }
        handleDrop(e) {
            this.stopEvent(e);
            var url = e.dataTransfer.getData('text/plain');
            if (url) {
                console.log('TODO drop url');
            }
            else {
                this.handleFiles(e.dataTransfer.files);
            }
        }
        constructor(element, handler) {
            this.handler = handler;
            this.element = element;
            this.element.addEventListener("dragenter", (e) => { this.handleDragEnter(e); }, false);
            this.element.addEventListener("dragover", (e) => { this.handleDragOver(e); }, false);
            this.element.addEventListener("drop", (e) => { this.handleDrop(e); }, false);
        }
    }
    exports.default = DropZone;
});
define("ExidyInput", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyOutput", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyKeyboard", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Keyboard {
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
    exports.default = Keyboard;
});
define("ExidyBrowserKeyboard", ["require", "exports", "ExidyKeyboard"], function (require, exports, ExidyKeyboard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const keymap = {
        13: { row: 11, key: 1 },
        16: { row: 0, key: 4 },
        65: { row: 2, key: 2 },
        48: { row: 9, key: 4 },
        49: { row: 2, key: 4 }
    };
    class BrowserKeyboard extends ExidyKeyboard_1.default {
        browserKeyUp(key) {
            if (key in keymap) {
                let mapping = keymap[key];
                this.release(mapping.row, mapping.key);
            }
        }
        browserKeyDown(key) {
            if (key in keymap) {
                let mapping = keymap[key];
                this.press(mapping.row, mapping.key);
            }
        }
    }
    exports.default = BrowserKeyboard;
});
define("ExidyCpu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyFile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyFileBinaryAjax", ["require", "exports", "BinaryAjax"], function (require, exports, BinaryAjax_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyFileBinaryAjax {
        read(url) {
            return BinaryAjax_1.default.read(url).then((data) => {
                console.log('Read ' + url);
                return data;
            });
        }
    }
    exports.default = ExidyFileBinaryAjax;
});
define("ExidyIo", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class NoInput {
        readByte(address) {
            return 255;
        }
    }
    class NoOutput {
        writeByte(address, data) {
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
        setHandler(address, length, handler) {
            for (let i = 0; i < length; ++i) {
                this.handlers[address + i] = handler;
            }
        }
    }
    class OutputMultiplexor {
        constructor() {
            this.handlers = new Array(256);
            this.handlers.fill(new NoOutput());
        }
        writeByte(address, data) {
            this.handlers[address & 0xFF].writeByte(address, data);
        }
        setHandler(address, length, handler) {
            for (let i = 0; i < length; ++i) {
                this.handlers[address + i] = handler;
            }
        }
    }
    class IoSystem {
        constructor(keyboard) {
            this._input = new InputMultiplexor();
            this._output = new OutputMultiplexor();
            this._output.setHandler(0xFE, 1, keyboard);
            this._input.setHandler(0xFE, 1, keyboard);
        }
        get output() {
            return this._output;
        }
        get input() {
            return this._input;
        }
    }
    exports.IoSystem = IoSystem;
});
define("ExidyMemory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ram {
        constructor(memory) {
            this.memory = memory;
        }
        readByte(address) {
            return this.memory[address];
        }
        ;
        writeByte(address, data) {
            this.memory[address] = data;
        }
        ;
    }
    exports.Ram = Ram;
    class Rom {
        constructor(memory) {
            this.memory = memory;
        }
        readByte(address) {
            return this.memory[address];
        }
        ;
        writeByte(address, data) {
        }
        ;
    }
    exports.Rom = Rom;
    class NoMemory {
        constructor() {
        }
        readByte(address) {
            return 0;
        }
        writeByte(address, data) {
        }
    }
    exports.NoMemory = NoMemory;
    const MEMORY_SIZE_IN_BYTES = 65536;
    class Multiplexor {
        constructor() {
            this.handlers = new Array(MEMORY_SIZE_IN_BYTES);
            this.handlers.fill(new NoMemory());
        }
        readByte(address) {
            return this.handlers[address].readByte(address);
        }
        writeByte(address, data) {
            this.handlers[address].writeByte(address, data);
        }
        setHandler(address, length, handler) {
            for (let i = 0; i < length; ++i) {
                this.handlers[address + i] = handler;
            }
        }
    }
    const CHARS_START = 0xF800;
    const CHARS_SIZE_BYTES = 8 * 256;
    class ExidyCharacters extends Ram {
        constructor(memory, byteCanvas, charsCanvas, charUpdated) {
            super(memory);
            this.charsCanvas = charsCanvas;
            this.byteCanvas = byteCanvas;
            this.byteCtx = byteCanvas.getContext("2d");
            this.charsCtx = charsCanvas.getContext("2d");
            this.charUpdated = charUpdated;
            for (let i = 0; i < 256; ++i) {
                let j = i;
                for (let x = 0; x < 8; ++x) {
                    this.byteCtx.fillStyle = ((j & 0x80) === 0x80) ? "white" : "black";
                    this.byteCtx.fillRect(x, i, 1, 1);
                    j <<= 1;
                }
            }
        }
        writeByte(address, data) {
            if (address >= 0xFC00 && (data !== this.readByte(address))) {
                super.writeByte(address, data);
                this.charUpdated(this.updateByte(address, data));
            }
        }
        updateByte(address, data) {
            let offset = address - CHARS_START;
            let row = offset & 0x7;
            let char = offset >> 3;
            this.charsCtx.drawImage(this.byteCanvas, 0, data, 8, 1, char << 3, row, 8, 1);
            return char;
        }
        updateAll() {
            for (let i = 0; i < (256 << 3); ++i) {
                let data = this.readByte(CHARS_START + i);
                this.updateByte(CHARS_START + i, data);
            }
        }
    }
    const SCREEN_START = 0xF080;
    const SCREEN_WIDTH = 64;
    const SCREEN_HEIGHT = 30;
    const SCREEN_SIZE_CHARS = SCREEN_WIDTH * SCREEN_HEIGHT;
    const SCREEN_SIZE_BYTES = SCREEN_SIZE_CHARS;
    class ExidyScreen extends Ram {
        constructor(memory, charsCanvas, screenCanvas) {
            super(memory);
            this.screenCanvas = screenCanvas;
            this.charsCanvas = charsCanvas;
            this.screenCtx = screenCanvas.getContext("2d");
        }
        writeByte(address, data) {
            if (data !== this.readByte(address)) {
                super.writeByte(address, data);
                this.updateByte(address, data);
            }
        }
        updateByte(address, data) {
            let index = address - SCREEN_START;
            let row = index >> 6;
            let col = index - (row << 6);
            let char = this.readByte(address);
            this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 4, 8, 16);
        }
        charUpdated(updatedChar) {
            for (let address = SCREEN_START; address < SCREEN_START + SCREEN_SIZE_BYTES; ++address) {
                let char = this.readByte(address);
                if (updatedChar === char) {
                    this.updateByte(address, char);
                }
            }
        }
        updateAll() {
            let address = SCREEN_START;
            for (let row = 0; row < SCREEN_HEIGHT; ++row) {
                for (let col = 0; col < SCREEN_WIDTH; ++col) {
                    let char = this.readByte(address++);
                    this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 4, 8, 16);
                }
            }
        }
    }
    class MemorySystem {
        constructor(byteCanvas, charsCanvas, screenCanvas) {
            this._memory = new Uint8Array(MEMORY_SIZE_IN_BYTES);
            this.ram = new Ram(this._memory);
            this.rom = new Rom(this._memory);
            this.multplexor = new Multiplexor();
            this.multplexor.setHandler(0, MEMORY_SIZE_IN_BYTES, this.ram);
            this.multplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);
            this.exidyScreen = new ExidyScreen(this._memory, charsCanvas, screenCanvas);
            this.exidyCharacters = new ExidyCharacters(this._memory, byteCanvas, charsCanvas, (char) => {
                this.exidyScreen.charUpdated(char);
            });
            this.multplexor.setHandler(SCREEN_START, SCREEN_SIZE_BYTES, this.exidyScreen);
            this.multplexor.setHandler(CHARS_START, CHARS_SIZE_BYTES, this.exidyCharacters);
        }
        load(data, address, start = 0) {
            let len = data.length - start;
            for (let i = 0; i < len; ++i) {
                this._memory[address + i] = data[i + start];
            }
        }
        loadRom(data, address) {
            for (let i = 0; i < data.length; ++i) {
                this._memory[address + i] = data[i];
            }
            this.multplexor.setHandler(address, data.length, this.rom);
        }
        get memory() {
            return this.multplexor;
        }
        updateCharacters() {
            this.exidyCharacters.updateAll();
        }
        updateScreen() {
            this.exidyScreen.updateAll();
        }
    }
    exports.MemorySystem = MemorySystem;
});
define("ExidyZ80", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyZ80 {
        constructor(memory, input, output) {
            this.cpu = new Z80({
                mem_read: (address) => { return memory.readByte(address); },
                mem_write: (address, data) => { memory.writeByte(address, data); },
                io_read: (address) => { return input.readByte(address); },
                io_write: (address, data) => { output.writeByte(address, data); }
            });
        }
        reset(address) {
            this.cpu.reset(address);
        }
        executeInstruction() {
            this.cpu.run_instruction();
        }
        load(data) {
            this.cpu.load({
                i: data[0],
                l_prime: data[1],
                h_prime: data[2],
                e_prime: data[3],
                d_prime: data[4],
                c_prime: data[5],
                b_prime: data[6],
                f_prime: data[7],
                a_prime: data[8],
                l: data[9],
                h: data[10],
                e: data[11],
                d: data[12],
                c: data[13],
                b: data[14],
                iy: data[15] | (data[16] << 8),
                ix: data[17] | (data[18] << 8),
                iff2: (data[19] & 0x04) !== 0 ? 1 : 0,
                iff1: (data[19] & 0x02) !== 0 ? 1 : 0,
                r: data[20],
                f: data[21],
                a: data[22],
                sp: data[23] | (data[24] << 8),
                imode: data[25],
                pc: data[26] | (data[27] << 8)
            });
        }
    }
    exports.ExidyZ80 = ExidyZ80;
});
define("ExidySorcerer", ["require", "exports", "ExidyZ80", "DropZone", "ExidyMemory", "ExidyIo"], function (require, exports, ExidyZ80_1, DropZone_1, ExidyMemory_1, ExidyIo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const defaultRoms = [
        { name: "exmo1-1.dat", address: 0xE000 },
        { name: "exmo1-2.dat", address: 0xE800 },
        { name: "exchr-1.dat", address: 0xF800 },
        { name: "diskboot.dat", address: 0xBC00 }
    ];
    class ExidySorcerer {
        constructor(filesystem, keyboard, byteCanvas, charsCanvas, screenCanvas) {
            this.filesystem = filesystem;
            this.memorySystem = new ExidyMemory_1.MemorySystem(byteCanvas, charsCanvas, screenCanvas);
            this.io = new ExidyIo_1.IoSystem(keyboard);
            this.cpu = new ExidyZ80_1.ExidyZ80(this.memorySystem.memory, this.io.input, this.io.output);
            this.ready = Promise.all(defaultRoms.map((romConfig) => {
                return filesystem.read('roms/' + romConfig.name).then((data) => {
                    this.memorySystem.loadRom(data, romConfig.address);
                    this.memorySystem.updateCharacters();
                    this.memorySystem.updateScreen();
                    this.reset();
                    return true;
                });
            }));
            new DropZone_1.default(screenCanvas, (buffer) => {
                this.loadSnpFromArray(new Uint8Array(buffer));
            });
        }
        loadSnpFromArray(data) {
            this.memorySystem.load(data, 0x0000, 28);
            this.memorySystem.updateCharacters();
            this.memorySystem.updateScreen();
            this.cpu.load(data);
        }
        load(snap) {
            this.ready = this.ready.then(() => {
                return this.filesystem.read('snaps/' + snap).then((data) => {
                    this.loadSnpFromArray(data);
                    return true;
                });
            });
        }
        reset() {
            this.cpu.reset(0xE000);
        }
        step() {
            for (let i = 0; i < 3000; ++i) {
                this.cpu.executeInstruction();
            }
        }
        run() {
            this.ready.then(() => {
                setInterval(() => {
                    this.step();
                }, 0);
            });
        }
    }
    exports.default = ExidySorcerer;
});
define("main", ["require", "exports", "ExidySorcerer", "ExidyFileBinaryAjax", "ExidyBrowserKeyboard"], function (require, exports, ExidySorcerer_1, ExidyFileBinaryAjax_1, ExidyBrowserKeyboard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let screenCanvas = document.getElementById('exidyScreen');
    let exidyFile = new ExidyFileBinaryAjax_1.default();
    let keyboard = new ExidyBrowserKeyboard_1.default();
    let exidySorcerer = new ExidySorcerer_1.default(exidyFile, keyboard, document.getElementById('exidyBytes'), document.getElementById('exidyCharacters'), screenCanvas);
    screenCanvas.addEventListener('keydown', (key) => {
        console.log(key);
        keyboard.browserKeyDown(key.keyCode);
    });
    screenCanvas.addEventListener('keyup', (key) => {
        console.log(key);
        keyboard.browserKeyUp(key.keyCode);
    });
    exidySorcerer.run();
});
