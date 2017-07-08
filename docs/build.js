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
    class KeyConfig {
        constructor(key, row, col, keyCode, keys) {
            this._key = key;
            this._row = row;
            this._col = col;
            this._keyCode = keyCode;
            this._keys = keys;
        }
        get row() {
            return this._row;
        }
        get col() {
            return this._col;
        }
        get keyCode() {
            return this._keyCode;
        }
        get keys() {
            return this._keys;
        }
    }
    const KEY_CONFIG = [
        new KeyConfig('BACK SPACE', 11, 0, 8, ['Backspace']),
        new KeyConfig('Tab', 1, 3, 9, ['Tab']),
        new KeyConfig('ENTER', 11, 1, 13, ['Enter']),
        new KeyConfig('SHIFT', 0, 4, 16, ['Shift']),
        new KeyConfig('CTRL', 0, 2, 17, ['Control']),
        new KeyConfig('ESC', 0, 0, 27, ['Escape']),
        new KeyConfig('SPACE', 1, 2, 32, [' ']),
        new KeyConfig('Unknown', 1, 4, 36, ['Home']),
        new KeyConfig('Delete', 15, 0, 46, ['Delete']),
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
        new KeyConfig('X', 2, 0, 88, ['x', 'X']),
        new KeyConfig('Y', 6, 3, 89, ['y', 'Y']),
        new KeyConfig('Z', 2, 1, 90, ['z', 'Z']),
        new KeyConfig('Grapxhics', 0, 1, 112, ['F1']),
        new KeyConfig('Clear', 1, 0, 117, ['F6']),
        new KeyConfig('Repeat', 1, 1, 119, ['F8']),
        new KeyConfig('^', 11, 3, 163, ['^']),
        new KeyConfig('-', 11, 4, 173, ['-']),
        new KeyConfig(',', 8, 0, 188, [',']),
        new KeyConfig('.', 9, 1, 190, ['.']),
        new KeyConfig('/', 9, 0, 191, ['/']),
        new KeyConfig('[', 10, 3, 219, [']']),
        new KeyConfig('[', 10, 2, 221, [']']),
        new KeyConfig('Backslash', 10, 0, 220, ['\\']),
        new KeyConfig('@', 10, 1, 192, ['@']),
        new KeyConfig('\'', 10, 4, 222, ['\'']),
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
    class BrowserKeyboard extends ExidyKeyboard_1.default {
        constructor() {
            super();
            this.keyCodeToConfig = KEY_CONFIG.reduce((m, keyConfig) => {
                m[keyConfig.keyCode] = keyConfig;
                return m;
            }, {});
        }
        browserKeyUp(key) {
            let mapping = this.keyCodeToConfig[key];
            if (mapping) {
                this.release(mapping.row, mapping.col);
            }
        }
        browserKeyDown(key) {
            let mapping = this.keyCodeToConfig[key];
            if (mapping) {
                this.press(mapping.row, mapping.col);
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
        keyboard.browserKeyDown(key.keyCode);
        key.stopPropagation();
        key.preventDefault();
    });
    screenCanvas.addEventListener('keyup', (key) => {
        keyboard.browserKeyUp(key.keyCode);
        key.stopPropagation();
        key.preventDefault();
    });
    exidySorcerer.run();
});
