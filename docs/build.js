define("BinaryAjax", ["require", "exports"], function (require, exports) {
    'use strict';
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
    'use strict';
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
            const url = e.dataTransfer.getData('text/plain');
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
            this.element.addEventListener('dragenter', (e) => { this.handleDragEnter(e); }, false);
            this.element.addEventListener('dragover', (e) => { this.handleDragOver(e); }, false);
            this.element.addEventListener('drop', (e) => { this.handleDrop(e); }, false);
        }
    }
    exports.default = DropZone;
});
define("ExidyDisk", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyDiskConsts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SECTORS_PER_TRACK = 16;
    exports.NUMBER_OF_TRACKS = 77;
    exports.BYTES_PER_SECTOR = 256 + 14;
});
define("ExidyArrayDisk", ["require", "exports", "ExidyDiskConsts"], function (require, exports, ExidyDiskConsts_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyArrayDisk {
        constructor(data) {
            this._data = data;
        }
        toIndex(track, sector, offset) {
            return (sector * ExidyDiskConsts_1.BYTES_PER_SECTOR) + (track * ExidyDiskConsts_1.SECTORS_PER_TRACK * ExidyDiskConsts_1.BYTES_PER_SECTOR) + offset;
        }
        read(track, sector, offset) {
            return this._data[this.toIndex(track, sector, offset)];
        }
        write(track, sector, offset, data) {
            this._data[this.toIndex(track, sector, offset)] = data;
        }
    }
    exports.default = ExidyArrayDisk;
});
define("ExidyTape", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyArrayTape", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ArrayTape {
        constructor(data) {
            this._index = 0;
            this._data = data;
        }
        readByte(baud) {
            let d = this._data[this._index++];
            if (this._index > this._data.length) {
                this._index = 0;
            }
            return d;
        }
        writeByte(baud, data) {
            this._data[this._index++] = data;
        }
    }
    exports.default = ArrayTape;
});
define("ExidyInput", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyOutput", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyKey", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyKey {
        constructor(id, row, col) {
            this._id = id;
            this._row = row;
            this._col = col;
        }
        get id() {
            return this._id;
        }
        get row() {
            return this._row;
        }
        get col() {
            return this._col;
        }
    }
    exports.default = ExidyKey;
});
define("ExidyKeyboard", ["require", "exports", "ExidyKey"], function (require, exports, ExidyKey_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Keyboard {
        constructor() {
            this.activeScanLine = 0;
            this.line = new Array(16);
            this.listener = null;
            this.line.fill(0xff);
            const keyArray = [
                new ExidyKey_1.default('BACK SPACE', 11, 0),
                new ExidyKey_1.default('Tab', 1, 3),
                new ExidyKey_1.default('ENTER', 11, 1),
                new ExidyKey_1.default('SHIFT', 0, 4),
                new ExidyKey_1.default('CTRL', 0, 2),
                new ExidyKey_1.default('SHIFT LOCK', 0, 3),
                new ExidyKey_1.default('ESC', 0, 0),
                new ExidyKey_1.default('SPACE', 1, 2),
                new ExidyKey_1.default('RUN STOP', 1, 4),
                new ExidyKey_1.default('Delete', 15, 0),
                new ExidyKey_1.default('0', 9, 4),
                new ExidyKey_1.default('1', 2, 4),
                new ExidyKey_1.default('2', 3, 4),
                new ExidyKey_1.default('3', 4, 4),
                new ExidyKey_1.default('4', 4, 3),
                new ExidyKey_1.default('5', 5, 4),
                new ExidyKey_1.default('6', 6, 4),
                new ExidyKey_1.default('7', 7, 4),
                new ExidyKey_1.default('8', 8, 4),
                new ExidyKey_1.default('9', 8, 3),
                new ExidyKey_1.default(';', 9, 2),
                new ExidyKey_1.default('A', 2, 2),
                new ExidyKey_1.default('B', 5, 0),
                new ExidyKey_1.default('C', 3, 0),
                new ExidyKey_1.default('D', 3, 1),
                new ExidyKey_1.default('E', 4, 2),
                new ExidyKey_1.default('F', 4, 0),
                new ExidyKey_1.default('G', 5, 2),
                new ExidyKey_1.default('H', 6, 2),
                new ExidyKey_1.default('I', 7, 1),
                new ExidyKey_1.default('J', 7, 2),
                new ExidyKey_1.default('K', 7, 0),
                new ExidyKey_1.default('L', 8, 1),
                new ExidyKey_1.default('M', 6, 0),
                new ExidyKey_1.default('N', 6, 1),
                new ExidyKey_1.default('O', 8, 2),
                new ExidyKey_1.default('P', 9, 3),
                new ExidyKey_1.default('Q', 2, 3),
                new ExidyKey_1.default('R', 4, 1),
                new ExidyKey_1.default('S', 3, 2),
                new ExidyKey_1.default('T', 5, 3),
                new ExidyKey_1.default('U', 7, 3),
                new ExidyKey_1.default('V', 5, 1),
                new ExidyKey_1.default('W', 3, 3),
                new ExidyKey_1.default('X', 2, 0),
                new ExidyKey_1.default('Y', 6, 3),
                new ExidyKey_1.default('Z', 2, 1),
                new ExidyKey_1.default('GRAPHIC', 0, 1),
                new ExidyKey_1.default('Clear', 1, 0),
                new ExidyKey_1.default('Repeat', 1, 1),
                new ExidyKey_1.default('^', 11, 3),
                new ExidyKey_1.default('-', 11, 4),
                new ExidyKey_1.default(',', 8, 0),
                new ExidyKey_1.default('.', 9, 1),
                new ExidyKey_1.default('/', 9, 0),
                new ExidyKey_1.default('[', 10, 3),
                new ExidyKey_1.default(']', 10, 2),
                new ExidyKey_1.default('Backslash', 10, 0),
                new ExidyKey_1.default('@', 10, 1),
                new ExidyKey_1.default(':', 10, 4),
                new ExidyKey_1.default('NUM_0', 13, 0),
                new ExidyKey_1.default('NUM_1', 13, 1),
                new ExidyKey_1.default('NUM_2', 14, 1),
                new ExidyKey_1.default('NUM_3', 15, 4),
                new ExidyKey_1.default('NUM_4', 13, 2),
                new ExidyKey_1.default('NUM_5', 14, 2),
                new ExidyKey_1.default('NUM_6', 14, 3),
                new ExidyKey_1.default('NUM_7', 13, 4),
                new ExidyKey_1.default('NUM_8', 13, 3),
                new ExidyKey_1.default('NUM_9', 14, 4),
                new ExidyKey_1.default('NUM_*', 12, 1),
                new ExidyKey_1.default('NUM_+', 12, 0),
                new ExidyKey_1.default('NUM_-', 12, 3),
                new ExidyKey_1.default('NUM_/', 12, 2),
                new ExidyKey_1.default('NUM_.', 14, 0),
                new ExidyKey_1.default('Unknown1', 15, 1),
                new ExidyKey_1.default('Unknown2', 15, 2),
                new ExidyKey_1.default('LINE FEED', 11, 2),
                new ExidyKey_1.default('NUM_=', 15, 3)
            ];
            this._keymap = keyArray.reduce((m, k) => {
                m[k.id] = k;
                return m;
            }, new Map());
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
        isPressed(row, key) {
            return ((~(this.line[row])) & (1 << key)) !== 0x00;
        }
        pressKey(keyId) {
            const key = this._keymap[keyId];
            if (!this.isPressed(key.row, key.col)) {
                this.press(key.row, key.col);
                if (this.listener)
                    this.listener(key.id, true);
            }
        }
        releaseKey(keyId) {
            const key = this._keymap[keyId];
            if (this.isPressed(key.row, key.col)) {
                this.release(key.row, key.col);
                if (this.listener)
                    this.listener(key.id, false);
            }
        }
    }
    exports.default = Keyboard;
});
define("ExidyBrowserKeyboard", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
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
    class BrowserKeyboard {
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
    exports.default = BrowserKeyboard;
});
define("ExidyBytes", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyBytes {
        static set2lm(data, address, value) {
            data[address] = value & 0xff;
            data[address + 1] = (value >>> 8) & 0xff;
        }
        static set2ml(data, address, value) {
            data[address + 1] = value & 0xff;
            data[address] = (value >>> 8) & 0xff;
        }
        static set4lm(data, address, value) {
            data[address] = value & 0xff;
            data[address + 1] = (value >>> 8) & 0xff;
            data[address + 2] = (value >>> 16) & 0xff;
            data[address + 3] = (value >>> 24) & 0xff;
        }
        static set4ml(data, address, value) {
            data[address + 3] = value & 0xff;
            data[address + 2] = (value >>> 8) & 0xff;
            data[address + 1] = (value >>> 16) & 0xff;
            data[address] = (value >>> 24) & 0xff;
        }
        static get2lm(data, address) {
            return data[address] +
                (data[address + 1] << 8);
        }
        static get2ml(data, address) {
            return data[address + 1] +
                (data[address] << 8);
        }
        static get4lm(data, address) {
            return data[address] +
                (data[address + 1] << 8) +
                (data[address + 2] << 16) +
                (data[address + 3] << 24);
        }
        static get4ml(data, address) {
            return data[address + 3] +
                (data[address + 2] << 8) +
                (data[address + 1] << 16) +
                (data[address] << 24);
        }
    }
    exports.default = ExidyBytes;
});
define("ExidyCentronics", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyCentronicsSystem", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class CentronicsSystem {
        set device(device) {
            this._device = device;
        }
        readByte(address) {
            return this._device ? this._device.readByte() : 0xff;
        }
        writeByte(address, data) {
            if (this._device)
                this._device.writeByte(data);
        }
    }
    exports.default = CentronicsSystem;
});
define("ExidyMemory", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MEMORY_SIZE_IN_BYTES = 65536;
    exports.CHARS_START = 0xF800;
    exports.SCREEN_START = 0xF080;
    exports.SCREEN_WIDTH = 64;
    exports.SCREEN_HEIGHT = 30;
    exports.SCREEN_SIZE_BYTES = exports.SCREEN_WIDTH * exports.SCREEN_HEIGHT;
    exports.CHARS_SIZE_BYTES = 8 * 256;
});
define("ExidyMemoryRam", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Ram {
        constructor(memory) {
            this._memory = memory;
        }
        readByte(address) {
            return this._memory[address];
        }
        writeByte(address, data) {
            this._memory[address] = data;
        }
    }
    exports.default = Ram;
});
define("ExidyCharacters", ["require", "exports", "ExidyMemoryRam", "ExidyMemory"], function (require, exports, ExidyMemoryRam_1, ExidyMemory_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyCharacters extends ExidyMemoryRam_1.default {
        constructor(memory, charsCanvas, charUpdated) {
            super(memory);
            this.charsCanvas = charsCanvas;
            this.byteCanvas = document.createElement('canvas');
            this.byteCanvas.width = 8;
            this.byteCanvas.height = 256;
            this.byteCtx = this.byteCanvas.getContext('2d');
            this.charsCtx = this.charsCanvas.getContext('2d');
            this.charUpdated = charUpdated;
            for (let i = 0; i < 256; ++i) {
                let j = i;
                for (let x = 0; x < 8; ++x) {
                    this.byteCtx.fillStyle = ((j & 0x80) === 0x80) ? 'white' : 'black';
                    this.byteCtx.fillRect(x, i, 1, 1);
                    j <<= 1;
                }
            }
        }
        writeByte(address, data) {
            if (data !== this.readByte(address)) {
                super.writeByte(address, data);
                const offset = address - ExidyMemory_1.CHARS_START;
                const row = offset & 0x7;
                const char = offset >> 3;
                this.charsCtx.drawImage(this.byteCanvas, 0, data, 8, 1, char << 3, row, 8, 1);
                this.charUpdated(char, row);
            }
        }
        updateAll() {
            for (let i = 0; i < (256 << 3); ++i) {
                const data = this.readByte(ExidyMemory_1.CHARS_START + i);
                const row = i & 0x7;
                const char = i >> 3;
                this.charsCtx.drawImage(this.byteCanvas, 0, data, 8, 1, char << 3, row, 8, 1);
            }
        }
    }
    exports.default = ExidyCharacters;
});
define("ExidyMonostable", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyMonostable {
        constructor(periodMillis, listener) {
            this._activate = false;
            this._interval = null;
            this._periodMillis = periodMillis;
            this._listener = listener;
        }
        activate() {
            if (this._interval) {
                this._activate = true;
            }
            else {
                this._activate = false;
                this._listener(true);
                this._interval = setInterval(() => {
                    if (this._activate) {
                        this._activate = false;
                    }
                    else {
                        clearInterval(this._interval);
                        this._interval = null;
                        this._listener(false);
                    }
                }, this._periodMillis);
            }
        }
    }
    exports.default = ExidyMonostable;
});
define("ExidyDiskDrive", ["require", "exports", "ExidyDiskConsts", "ExidyMonostable"], function (require, exports, ExidyDiskConsts_2, ExidyMonostable_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const ACTIVE_FOR_TICKS = 400;
    class ExidyDiskDrive {
        constructor(unitNumber) {
            this._activeCount = 0;
            this._sectorNumber = 0;
            this._trackNumber = 0;
            this._newSector = false;
            this._disk = null;
            this._sectorIndex = 0;
            this._writeIndex = 0;
            this.motorListener = null;
            this.writeListener = null;
            this._unitNumber = unitNumber;
            this._writeMonostable = new ExidyMonostable_1.default(2000, writing => {
                if (this.writeListener) {
                    this.writeListener(writing);
                }
            });
        }
        getUnitLetter() {
            return 'ABCD'.charAt(this._unitNumber);
        }
        set disk(disk) {
            this._disk = disk;
        }
        get disk() {
            return this._disk;
        }
        diskIn() {
            return this._disk != null;
        }
        dataReady() {
            return true;
        }
        home() {
            return this._trackNumber === 0;
        }
        stepForward() {
            if (this._trackNumber < (ExidyDiskConsts_2.NUMBER_OF_TRACKS - 1)) {
                ++this._trackNumber;
            }
        }
        stepBackward() {
            if (this._trackNumber > 0) {
                --this._trackNumber;
            }
        }
        active() {
            return this._activeCount > 0;
        }
        activate() {
            if (this._activeCount === 0) {
                if (this.motorListener)
                    this.motorListener(true);
                this._activeCount = ACTIVE_FOR_TICKS;
            }
        }
        writeReg0(b) {
            switch (b) {
                case 0xA0:
                    break;
                case 0x20:
                case 0x21:
                    this.activate();
                    break;
                case 0x60:
                    this.stepBackward();
                    break;
                case 0x61:
                    this.stepForward();
                    break;
            }
        }
        readyWrite() {
            this._writeIndex = 0;
        }
        writeReg1(b) {
            switch (b) {
                case 0xA0:
                    break;
                case 0x20:
                case 0x21:
                    this.activate();
                    break;
                case 0x60:
                    this.stepBackward();
                    break;
                case 0x61:
                    this.stepForward();
                    break;
            }
        }
        writeReg2(b) {
            if (this.active()) {
                this._activeCount = ACTIVE_FOR_TICKS;
            }
            this._writeMonostable.activate();
            this._disk.write(this._trackNumber, this._sectorNumber, this._writeIndex++, b);
        }
        readReg0() {
            if (this.active()) {
                this._activeCount = ACTIVE_FOR_TICKS;
            }
            let r = this._sectorNumber;
            if (this._newSector) {
                r |= 0x80;
                this._newSector = false;
            }
            return r;
        }
        readReg1() {
            let r = 0;
            if (this.active())
                r |= 0x20;
            if (this.home())
                r |= 0x08;
            if (this.dataReady())
                r |= 0x80;
            return r;
        }
        readReg2() {
            if (this.active()) {
                this._activeCount = ACTIVE_FOR_TICKS;
            }
            if (this._disk != null) {
                if (this._sectorIndex < ExidyDiskConsts_2.BYTES_PER_SECTOR) {
                    let data = this._disk.read(this._trackNumber, this._sectorNumber, this._sectorIndex++);
                    return data & 0xff;
                }
            }
            return 0;
        }
        tick() {
            if (this.active()) {
                this._sectorNumber++;
                this._sectorIndex = 0;
                if (this._sectorNumber >= ExidyDiskConsts_2.SECTORS_PER_TRACK) {
                    this._sectorNumber = 0;
                }
                this._newSector = true;
                this._activeCount--;
                if (!this.active()) {
                    if (this.motorListener)
                        this.motorListener(false);
                }
            }
        }
    }
    exports.default = ExidyDiskDrive;
});
define("ExidyMemoryType", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyMemoryRegionType {
        constructor(code, description, start, end) {
            this._code = code;
            this._description = description;
            this._start = start;
            this._length = end - start + 1;
        }
        get code() {
            return this._code;
        }
        get description() {
            return this._description;
        }
        get start() {
            return this._start;
        }
        get length() {
            return this._length;
        }
    }
    exports.default = ExidyMemoryRegionType;
});
define("ExidyMemoryTyped", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class MemoryTyped {
        constructor(memory, memoryType) {
            this._memory = memory;
            this._memoryType = memoryType;
        }
        memoryType() {
            return this._memoryType;
        }
        memory() {
            return this._memory;
        }
    }
    exports.default = MemoryTyped;
});
define("ExidyMemoryTypes", ["require", "exports", "ExidyMemoryType"], function (require, exports, ExidyMemoryType_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyMemoryTypes {
        static getMap() {
            if (ExidyMemoryTypes._map === null) {
                ExidyMemoryTypes._map = new Map();
                ExidyMemoryTypes._map[ExidyMemoryTypes.None.code] = ExidyMemoryTypes.None;
                ExidyMemoryTypes._map[ExidyMemoryTypes.Ram.code] = ExidyMemoryTypes.Ram;
                ExidyMemoryTypes._map[ExidyMemoryTypes.DiskSystemRom.code] = ExidyMemoryTypes.DiskSystemRom;
                ExidyMemoryTypes._map[ExidyMemoryTypes.DiskSystemInterface.code] = ExidyMemoryTypes.DiskSystemInterface;
                ExidyMemoryTypes._map[ExidyMemoryTypes.RomPack8K.code] = ExidyMemoryTypes.RomPack8K;
                ExidyMemoryTypes._map[ExidyMemoryTypes.MonitorRom.code] = ExidyMemoryTypes.MonitorRom;
                ExidyMemoryTypes._map[ExidyMemoryTypes.VideoScratchRam.code] = ExidyMemoryTypes.VideoScratchRam;
                ExidyMemoryTypes._map[ExidyMemoryTypes.ScreenRam.code] = ExidyMemoryTypes.ScreenRam;
                ExidyMemoryTypes._map[ExidyMemoryTypes.AsciiCharacterRom.code] = ExidyMemoryTypes.AsciiCharacterRom;
                ExidyMemoryTypes._map[ExidyMemoryTypes.UserCharacterRam.code] = ExidyMemoryTypes.UserCharacterRam;
            }
            return ExidyMemoryTypes._map;
        }
        static getType(code) {
            return ExidyMemoryTypes.getMap()[code];
        }
    }
    ExidyMemoryTypes.UserCharacterRam = new ExidyMemoryType_1.default(9, 'User defined character RAM', 0xFC00, 0xFFFF);
    ExidyMemoryTypes.AsciiCharacterRom = new ExidyMemoryType_1.default(8, 'ASCII character ROM', 0xF800, 0xFBFF);
    ExidyMemoryTypes.ScreenRam = new ExidyMemoryType_1.default(7, 'Screen RAM', 0xF080, 0xF7FF);
    ExidyMemoryTypes.VideoScratchRam = new ExidyMemoryType_1.default(6, 'Video scratch RAM', 0xF000, 0xF07F);
    ExidyMemoryTypes.MonitorRom = new ExidyMemoryType_1.default(5, 'Monitor ROM', 0xE000, 0xEFFF);
    ExidyMemoryTypes.RomPack8K = new ExidyMemoryType_1.default(4, '8K ROM Pack', 0xC000, 0xDFFF);
    ExidyMemoryTypes.DiskSystemInterface = new ExidyMemoryType_1.default(3, 'Disk system interface', 0xBE00, 0xBE7F);
    ExidyMemoryTypes.DiskSystemRom = new ExidyMemoryType_1.default(2, 'Disk system ROM', 0xBC00, 0xBCFF);
    ExidyMemoryTypes.Ram = new ExidyMemoryType_1.default(1, 'RAM', 0x0000, 0xBFFF);
    ExidyMemoryTypes.None = new ExidyMemoryType_1.default(0, 'None', 0x0000, 0xFFFF);
    ExidyMemoryTypes._map = null;
    exports.default = ExidyMemoryTypes;
});
define("ExidyMemoryRegion", ["require", "exports", "ExidyMemoryTypes", "ExidyBytes"], function (require, exports, ExidyMemoryTypes_1, ExidyBytes_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyMemoryRegion {
        constructor(memoryType, start, length) {
            this._memoryType = memoryType;
            this._start = start;
            this._length = length;
        }
        get start() {
            return this._start;
        }
        get length() {
            return this._length;
        }
        get memoryType() {
            return this._memoryType;
        }
        hex(num, len) {
            const str = num.toString(16);
            return "0".repeat(len - str.length) + str;
        }
        get text() {
            return this.hex(this._start, 4) + ' - ' +
                this.hex(this._start + this._length - 1, 4) + ' ' +
                this._memoryType.description;
        }
        static getSnp2Size() {
            return 5;
        }
        saveSnp2(data, address) {
            data[address] = this._memoryType.code;
            ExidyBytes_1.default.set2ml(data, address + 1, this._start);
            ExidyBytes_1.default.set2ml(data, address + 3, this._length);
            return ExidyMemoryRegion.getSnp2Size();
        }
        static loadSnp2(data, address) {
            const memoryTypeCode = data[address];
            const memoryType = ExidyMemoryTypes_1.default.getType(memoryTypeCode);
            const start = ExidyBytes_1.default.get2ml(data, address + 1);
            const length = ExidyBytes_1.default.get2ml(data, address + 3);
            return new ExidyMemoryRegion(memoryType, start, length);
        }
    }
    exports.default = ExidyMemoryRegion;
});
define("ExidyMemoryNone", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class NoMemory {
        constructor() {
        }
        readByte(address) {
            return 0;
        }
        writeByte(address, data) {
        }
    }
    exports.default = NoMemory;
});
define("ExidyMemoryRom", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Rom {
        constructor(memory) {
            this._memory = memory;
        }
        readByte(address) {
            return this._memory[address];
        }
        writeByte(address, data) {
        }
    }
    exports.default = Rom;
});
define("ExidyScreen", ["require", "exports", "ExidyMemoryRam", "ExidyMemory"], function (require, exports, ExidyMemoryRam_2, ExidyMemory_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyScreen extends ExidyMemoryRam_2.default {
        constructor(memory, charsCanvas) {
            super(memory);
            this.screenCanvas = document.createElement('canvas');
            this.screenCanvas.width = 512;
            this.screenCanvas.height = 240;
            this.charsCanvas = charsCanvas;
            this.screenCtx = this.screenCanvas.getContext('2d');
        }
        get canvas() {
            return this.screenCanvas;
        }
        writeByte(address, data) {
            if (data !== this.readByte(address)) {
                super.writeByte(address, data);
                this.updateByte(address, data);
            }
        }
        updateByte(address, data) {
            const index = address - ExidyMemory_2.SCREEN_START;
            const row = index >> 6;
            const col = index - (row << 6);
            const char = this.readByte(address);
            this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 3, 8, 8);
        }
        charUpdated(updatedChar, updatedRow) {
            for (let address = ExidyMemory_2.SCREEN_START; address < ExidyMemory_2.SCREEN_START + ExidyMemory_2.SCREEN_SIZE_BYTES; ++address) {
                const char = this.readByte(address);
                if (updatedChar === char) {
                    const index = address - ExidyMemory_2.SCREEN_START;
                    const row = index >> 6;
                    const col = index - (row << 6);
                    this.screenCtx.drawImage(this.charsCanvas, char << 3, updatedRow, 8, 1, col << 3, (row << 3) + updatedRow, 8, 1);
                }
            }
        }
        updateAll() {
            for (let address = ExidyMemory_2.SCREEN_START; address < ExidyMemory_2.SCREEN_START + ExidyMemory_2.SCREEN_SIZE_BYTES; ++address) {
                const char = this.readByte(address);
                this.updateByte(address, char);
            }
        }
    }
    exports.default = ExidyScreen;
});
define("ExidyMemorySystem", ["require", "exports", "ExidyMemoryTyped", "ExidyMemoryTypes", "ExidyMemoryRegion", "ExidyMemory", "ExidyMemoryRam", "ExidyMemoryRom", "ExidyCharacters", "ExidyScreen"], function (require, exports, ExidyMemoryTyped_1, ExidyMemoryTypes_2, ExidyMemoryRegion_1, ExidyMemory_3, ExidyMemoryRam_3, ExidyMemoryRom_1, ExidyCharacters_1, ExidyScreen_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Multiplexor {
        constructor(nomem) {
            this._ignoreBits = 7;
            this.handlers = new Array(ExidyMemory_3.MEMORY_SIZE_IN_BYTES >> this._ignoreBits);
            this.handlers.fill(nomem);
            this._nomem = nomem;
        }
        readByte(address) {
            return this.handlers[address >>> this._ignoreBits].memory().readByte(address);
        }
        writeByte(address, data) {
            this.handlers[address >>> this._ignoreBits].memory().writeByte(address, data);
        }
        checkGranularity(address) {
            return ((address >>> this._ignoreBits) << this._ignoreBits) === address;
        }
        fill(address, length, handler) {
            if (!this.checkGranularity(address) || !this.checkGranularity(length)) {
                console.log('WARNING: handler granularity missmatch');
                console.log(address.toString(16) + " " + length.toString(16));
            }
            this.handlers.fill(handler, address >> this._ignoreBits, (address + length) >> this._ignoreBits);
        }
        clearHandler(memoryType) {
            const address = memoryType.start;
            const length = memoryType.length;
            this.fill(address, length, this._nomem);
        }
        setHandler(handler, address, length) {
            this.fill(address == undefined ? handler.memoryType().start : address, length == undefined ? handler.memoryType().length : length, handler);
        }
        getRegions() {
            const regions = [];
            let start = null;
            let memoryType = null;
            for (let i = 0; i < this.handlers.length + 1; ++i) {
                const nextMemoryType = i < this.handlers.length ? this.handlers[i].memoryType() : null;
                const typeCode = memoryType ? memoryType.code : null;
                const nextTypeCode = nextMemoryType ? nextMemoryType.code : null;
                const address = i << this._ignoreBits;
                if (nextTypeCode != typeCode) {
                    if (typeCode !== null) {
                        regions.push(new ExidyMemoryRegion_1.default(memoryType, start, address - start));
                    }
                    start = address;
                    memoryType = nextMemoryType;
                }
            }
            return regions;
        }
    }
    class MemorySystem {
        constructor() {
            this._memory = new Uint8Array(ExidyMemory_3.MEMORY_SIZE_IN_BYTES);
            this._handlerMap = new Map();
            const charsCanvas = document.createElement('canvas');
            charsCanvas.width = 2048;
            charsCanvas.height = 8;
            this.exidyScreen = new ExidyScreen_1.default(this._memory, charsCanvas);
            this.exidyCharacters = new ExidyCharacters_1.default(this._memory, charsCanvas, (char, row) => {
                this.exidyScreen.charUpdated(char, row);
            });
            this._ram = new ExidyMemoryRam_3.default(this._memory);
            this._rom = new ExidyMemoryRom_1.default(this._memory);
            this._handlerMap[ExidyMemoryTypes_2.default.None.code] = new ExidyMemoryTyped_1.default(this._rom, ExidyMemoryTypes_2.default.None);
            this._handlerMap[ExidyMemoryTypes_2.default.Ram.code] = new ExidyMemoryTyped_1.default(this._ram, ExidyMemoryTypes_2.default.Ram);
            this._handlerMap[ExidyMemoryTypes_2.default.DiskSystemRom.code] = new ExidyMemoryTyped_1.default(this._rom, ExidyMemoryTypes_2.default.DiskSystemRom);
            this._handlerMap[ExidyMemoryTypes_2.default.RomPack8K.code] = new ExidyMemoryTyped_1.default(this._rom, ExidyMemoryTypes_2.default.RomPack8K);
            this._handlerMap[ExidyMemoryTypes_2.default.MonitorRom.code] = new ExidyMemoryTyped_1.default(this._rom, ExidyMemoryTypes_2.default.MonitorRom);
            this._handlerMap[ExidyMemoryTypes_2.default.VideoScratchRam.code] = new ExidyMemoryTyped_1.default(this._ram, ExidyMemoryTypes_2.default.VideoScratchRam);
            this._handlerMap[ExidyMemoryTypes_2.default.ScreenRam.code] = new ExidyMemoryTyped_1.default(this.exidyScreen, ExidyMemoryTypes_2.default.ScreenRam);
            this._handlerMap[ExidyMemoryTypes_2.default.AsciiCharacterRom.code] = new ExidyMemoryTyped_1.default(this._rom, ExidyMemoryTypes_2.default.AsciiCharacterRom);
            this._handlerMap[ExidyMemoryTypes_2.default.UserCharacterRam.code] = new ExidyMemoryTyped_1.default(this.exidyCharacters, ExidyMemoryTypes_2.default.UserCharacterRam);
            this.multiplexor = new Multiplexor(this._handlerMap[ExidyMemoryTypes_2.default.None.code]);
            this.loadDefaults();
        }
        loadDefaults() {
            this.multiplexor.setHandler(this._handlerMap[ExidyMemoryTypes_2.default.None.code]);
            this.multiplexor.setHandler(this._handlerMap[ExidyMemoryTypes_2.default.Ram.code]);
            this.multiplexor.setHandler(this._handlerMap[ExidyMemoryTypes_2.default.VideoScratchRam.code]);
            this.multiplexor.setHandler(this._handlerMap[ExidyMemoryTypes_2.default.ScreenRam.code]);
            this.multiplexor.setHandler(this._handlerMap[ExidyMemoryTypes_2.default.UserCharacterRam.code]);
        }
        loadRegion(region) {
            const handler = this._handlerMap[region.memoryType.code];
            if (handler == undefined) {
                throw new Error('Missing memory handler for type ' + region.memoryType.code);
            }
            this.multiplexor.setHandler(handler, region.start, region.length);
        }
        loadRegions(regions) {
            regions.forEach(region => { this.loadRegion(region); });
        }
        get screenCanvas() {
            return this.exidyScreen.canvas;
        }
        loadRom(data, memoryType) {
            const start = memoryType.start;
            const length = memoryType.length;
            if (data.length !== length) {
                throw new Error('ROM length mismatch');
            }
            this._memory.set(data, start);
            this.multiplexor.setHandler(new ExidyMemoryTyped_1.default(this._rom, memoryType));
        }
        loadMonitorRom(data) {
            this.loadRom(data, ExidyMemoryTypes_2.default.MonitorRom);
        }
        loadDiskSystemRom(data) {
            this.loadRom(data, ExidyMemoryTypes_2.default.DiskSystemRom);
        }
        loadDiskSystem(diskSystem) {
            this.multiplexor.setHandler(new ExidyMemoryTyped_1.default(diskSystem, ExidyMemoryTypes_2.default.DiskSystemInterface));
        }
        loadAsciiCharacterRom(data) {
            this.loadRom(data, ExidyMemoryTypes_2.default.AsciiCharacterRom);
        }
        loadRomPack8K(data) {
            this.loadRom(data, ExidyMemoryTypes_2.default.RomPack8K);
        }
        ejectRomPack8K() {
            this.multiplexor.clearHandler(ExidyMemoryTypes_2.default.RomPack8K);
            this._memory.fill(0, ExidyMemoryTypes_2.default.RomPack8K.start, ExidyMemoryTypes_2.default.RomPack8K.start + ExidyMemoryTypes_2.default.RomPack8K.length);
        }
        getSnp2RegionsSize() {
            return 1 +
                ExidyMemoryRegion_1.default.getSnp2Size() * this.getRegions().length;
        }
        saveSnp2Regions(data, address) {
            const regions = this.getRegions();
            data[address++] = regions.length;
            for (let i = 0; i < regions.length; ++i) {
                address += regions[i].saveSnp2(data, address);
            }
        }
        loadSnp2Regions(data, address) {
            const numberOfRegions = data[address++];
            for (let i = 0; i < numberOfRegions; ++i) {
                const region = ExidyMemoryRegion_1.default.loadSnp2(data, address);
                this.loadRegion(region);
                address += ExidyMemoryRegion_1.default.getSnp2Size();
            }
        }
        getSnp2Size() {
            return this._memory.length + this.getSnp2RegionsSize();
        }
        saveSnp2(data, address) {
            data.set(this._memory, address);
            this.saveSnp2Regions(data, address + this._memory.length);
        }
        loadSnp2(data, address) {
            const regionsAddress = address + ExidyMemory_3.MEMORY_SIZE_IN_BYTES;
            this._memory.set(data.subarray(address, regionsAddress));
            this.loadSnp2Regions(data, regionsAddress);
        }
        load(data, address, start = 0) {
            this._memory.set(data.subarray(start), address);
        }
        get memory() {
            return this.multiplexor;
        }
        updateCharacters() {
            this.exidyCharacters.updateAll();
        }
        updateScreen() {
            this.exidyScreen.updateAll();
        }
        getMem(start, length) {
            return this._memory.subarray(start, start + length);
        }
        getRegions() {
            return this.multiplexor.getRegions();
        }
    }
    exports.default = MemorySystem;
});
define("ExidyDiskSystem", ["require", "exports", "ExidyDiskDrive"], function (require, exports, ExidyDiskDrive_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const MEM_DISK_REG_START = 0xBE00;
    const MEM_DISK_REG_LEN = 128;
    class ExidyDiskSystem {
        constructor(memorySystem) {
            this._drives = new Array(4);
            this._activeDrive = null;
            this._activeDriveNumber = 0x40;
            for (let i = 0; i < this._drives.length; ++i) {
                this._drives[i] = new ExidyDiskDrive_1.default(i);
            }
            memorySystem.loadDiskSystem(this);
        }
        getDiskDrive(drive) {
            return this._drives[drive];
        }
        insertDisk(disk, drive) {
            this._drives[drive].disk = disk;
        }
        dataReady() {
            return this._activeDrive === null ? false : this._activeDrive.dataReady();
        }
        home() {
            return this._activeDrive !== null ? this._activeDrive.home() : false;
        }
        stepForward() {
            if (this._activeDrive !== null) {
                this._activeDrive.stepForward();
            }
        }
        stepBackward() {
            if (this._activeDrive != null) {
                this._activeDrive.stepBackward();
            }
        }
        readyWrite() {
            if (this._activeDrive != null) {
                this._activeDrive.readyWrite();
            }
        }
        activate(drive) {
            this._activeDriveNumber = drive;
            this._activeDrive = this._drives[drive];
            this._activeDrive.activate();
        }
        active() {
            return this._activeDrive !== null;
        }
        writeReg0(b) {
            switch (b) {
                case 0xA0: break;
                case 0x20:
                    this.activate(0);
                    break;
                case 0x21:
                    this.activate(1);
                    break;
                case 0x22:
                    this.activate(2);
                    break;
                case 0x23:
                    this.activate(3);
                    break;
                case 0x60:
                    this.stepBackward();
                    break;
                case 0x61:
                    this.stepForward();
                    break;
                case 0x80:
                    this.readyWrite();
                    break;
            }
        }
        writeReg1(b) {
            switch (b) {
                case 0xA0: break;
                case 0x20:
                    this.activate(0);
                    break;
                case 0x21:
                    this.activate(1);
                    break;
                case 0x22:
                    this.activate(2);
                    break;
                case 0x23:
                    this.activate(3);
                    break;
                case 0x60:
                    this.stepBackward();
                    break;
                case 0x61:
                    this.stepForward();
                    break;
                case 0x80:
                    this.readyWrite();
                    break;
            }
        }
        writeReg2(b) {
            if (this._activeDrive != null) {
                this._activeDrive.writeReg2(b);
            }
        }
        readReg0() {
            return this._activeDrive !== null ? this._activeDrive.readReg0() : 0;
        }
        readReg1() {
            let r = this._activeDriveNumber;
            if (this.active())
                r |= 0x20;
            if (this.home())
                r |= 0x08;
            if (this.dataReady())
                r |= 0x80;
            return r;
        }
        readReg2() {
            return this._activeDrive === null ? 0 : this._activeDrive.readReg2();
        }
        writeByte(address, b) {
            switch (address - MEM_DISK_REG_START) {
                case 0:
                    this.writeReg0(b);
                    break;
                case 1:
                    this.writeReg1(b);
                    break;
                case 2:
                    this.writeReg2(b);
                    break;
            }
        }
        readByte(address) {
            switch (address - MEM_DISK_REG_START) {
                case 0: return this.readReg0();
                case 1: return this.readReg1();
                case 2: return this.readReg2();
            }
            return 0;
        }
        tick() {
            for (let i = 0; i < this._drives.length; ++i) {
                this._drives[i].tick();
            }
            if (this._activeDrive !== null) {
                if (this._activeDrive.active() === false) {
                    this._activeDrive = null;
                    this._activeDriveNumber = 0x40;
                }
            }
        }
    }
    exports.default = ExidyDiskSystem;
});
define("ExidyElementPrinter", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ElementPrinter {
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
    exports.default = ElementPrinter;
});
define("ExidyFile", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyFileBinaryAjax", ["require", "exports", "BinaryAjax"], function (require, exports, BinaryAjax_1) {
    'use scrict';
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
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
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
    class IoSystem {
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
    exports.IoSystem = IoSystem;
});
define("ExidyZ80", ["require", "exports", "ExidyBytes"], function (require, exports, ExidyBytes_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Z80(coreParameter) {
        let core = coreParameter;
        if (!core || (typeof core.mem_read !== "function") || (typeof core.mem_write !== "function") ||
            (typeof core.io_read !== "function") || (typeof core.io_write !== "function"))
            throw ("Z80: Core object is missing required functions.");
        if (this === window)
            throw ("Z80: This function is a constructor; call it using operator new.");
        let a = 0x00;
        let b = 0x00;
        let c = 0x00;
        let d = 0x00;
        let e = 0x00;
        let h = 0x00;
        let l = 0x00;
        let a_prime = 0x00;
        let b_prime = 0x00;
        let c_prime = 0x00;
        let d_prime = 0x00;
        let e_prime = 0x00;
        let h_prime = 0x00;
        let l_prime = 0x00;
        let ix = 0x0000;
        let iy = 0x0000;
        let i = 0x00;
        let r = 0x00;
        let sp = 0xdff0;
        let pc = 0x0000;
        let flags = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
        let flags_prime = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
        let imode = 0;
        let iff1 = 0;
        let iff2 = 0;
        let halted = false;
        let do_delayed_di = false;
        let do_delayed_ei = false;
        let cycle_counter = 0;
        function getState() {
            return {
                b: b,
                a: a,
                c: c,
                d: d,
                e: e,
                h: h,
                l: l,
                a_prime: a_prime,
                b_prime: b_prime,
                c_prime: c_prime,
                d_prime: d_prime,
                e_prime: e_prime,
                h_prime: h_prime,
                l_prime: l_prime,
                ix: ix,
                iy: iy,
                i: i,
                r: r,
                sp: sp,
                pc: pc,
                flags: {
                    S: flags.S,
                    Z: flags.Z,
                    Y: flags.Y,
                    H: flags.H,
                    X: flags.X,
                    P: flags.P,
                    N: flags.N,
                    C: flags.C
                },
                flags_prime: {
                    S: flags_prime.S,
                    Z: flags_prime.Z,
                    Y: flags_prime.Y,
                    H: flags_prime.H,
                    X: flags_prime.X,
                    P: flags_prime.P,
                    N: flags_prime.N,
                    C: flags_prime.C
                },
                imode: imode,
                iff1: iff1,
                iff2: iff2,
                halted: halted,
                do_delayed_di: do_delayed_di,
                do_delayed_ei: do_delayed_ei,
                cycle_counter: cycle_counter
            };
        }
        function setState(state) {
            b = state.b;
            a = state.a;
            c = state.c;
            d = state.d;
            e = state.e;
            h = state.h;
            l = state.l;
            a_prime = state.a_prime;
            b_prime = state.b_prime;
            c_prime = state.c_prime;
            d_prime = state.d_prime;
            e_prime = state.e_prime;
            h_prime = state.h_prime;
            l_prime = state.l_prime;
            ix = state.ix;
            iy = state.iy;
            i = state.i;
            r = state.r;
            sp = state.sp;
            pc = state.pc;
            flags.S = state.flags.S;
            flags.Z = state.flags.Z;
            flags.Y = state.flags.Y;
            flags.H = state.flags.H;
            flags.X = state.flags.X;
            flags.P = state.flags.P;
            flags.N = state.flags.N;
            flags.C = state.flags.C;
            flags_prime.S = state.flags_prime.S;
            flags_prime.Z = state.flags_prime.Z;
            flags_prime.Y = state.flags_prime.Y;
            flags_prime.H = state.flags_prime.H;
            flags_prime.X = state.flags_prime.X;
            flags_prime.P = state.flags_prime.P;
            flags_prime.N = state.flags_prime.N;
            flags_prime.C = state.flags_prime.C;
            imode = state.imode;
            iff1 = state.iff1;
            iff2 = state.iff2;
            halted = state.halted;
            do_delayed_di = state.do_delayed_di;
            do_delayed_ei = state.do_delayed_ei;
            cycle_counter = state.cycle_counter;
        }
        let reset = function () {
            sp = 0xdff0;
            pc = 0x0000;
            a = 0x00;
            r = 0x00;
            set_flags_register(0);
            imode = 0;
            iff1 = 0;
            iff2 = 0;
            halted = false;
            do_delayed_di = false;
            do_delayed_ei = false;
            cycle_counter = 0;
        };
        let run_instruction = function () {
            if (!halted) {
                var doing_delayed_di = false, doing_delayed_ei = false;
                if (do_delayed_di) {
                    do_delayed_di = false;
                    doing_delayed_di = true;
                }
                else if (do_delayed_ei) {
                    do_delayed_ei = false;
                    doing_delayed_ei = true;
                }
                r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
                var opcode = core.mem_read(pc);
                decode_instruction(opcode);
                pc = (pc + 1) & 0xffff;
                if (doing_delayed_di) {
                    iff1 = 0;
                    iff2 = 0;
                }
                else if (doing_delayed_ei) {
                    iff1 = 1;
                    iff2 = 1;
                }
                var retval = cycle_counter;
                cycle_counter = 0;
                return retval;
            }
            else {
                return 1;
            }
        };
        let interrupt = function (non_maskable, data) {
            if (non_maskable) {
                r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
                halted = false;
                iff2 = iff1;
                iff1 = 0;
                push_word(pc);
                pc = 0x66;
                cycle_counter += 11;
            }
            else if (iff1) {
                r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
                halted = false;
                iff1 = 0;
                iff2 = 0;
                if (imode === 0) {
                    decode_instruction(data);
                    cycle_counter += 2;
                }
                else if (imode === 1) {
                    push_word(pc);
                    pc = 0x38;
                    cycle_counter += 13;
                }
                else if (imode === 2) {
                    push_word(pc);
                    var vector_address = ((i << 8) | data);
                    pc = core.mem_read(vector_address) |
                        (core.mem_read((vector_address + 1) & 0xffff) << 8);
                    cycle_counter += 19;
                }
            }
        };
        let decode_instruction = function (opcode) {
            var get_operand = function (opcode) {
                return ((opcode & 0x07) === 0) ? b :
                    ((opcode & 0x07) === 1) ? c :
                        ((opcode & 0x07) === 2) ? d :
                            ((opcode & 0x07) === 3) ? e :
                                ((opcode & 0x07) === 4) ? h :
                                    ((opcode & 0x07) === 5) ? l :
                                        ((opcode & 0x07) === 6) ? core.mem_read(l | (h << 8)) : a;
            };
            if (opcode === 0x76) {
                halted = true;
            }
            else if ((opcode >= 0x40) && (opcode < 0x80)) {
                var operand = get_operand(opcode);
                if (((opcode & 0x38) >>> 3) === 0)
                    b = operand;
                else if (((opcode & 0x38) >>> 3) === 1)
                    c = operand;
                else if (((opcode & 0x38) >>> 3) === 2)
                    d = operand;
                else if (((opcode & 0x38) >>> 3) === 3)
                    e = operand;
                else if (((opcode & 0x38) >>> 3) === 4)
                    h = operand;
                else if (((opcode & 0x38) >>> 3) === 5)
                    l = operand;
                else if (((opcode & 0x38) >>> 3) === 6)
                    core.mem_write(l | (h << 8), operand);
                else if (((opcode & 0x38) >>> 3) === 7)
                    a = operand;
            }
            else if ((opcode >= 0x80) && (opcode < 0xc0)) {
                var operand = get_operand(opcode), op_array = [do_add, do_adc, do_sub, do_sbc,
                    do_and, do_xor, do_or, do_cp];
                op_array[(opcode & 0x38) >>> 3](operand);
            }
            else {
                var func = instructions[opcode];
                func();
            }
            cycle_counter += cycle_counts[opcode];
        };
        let get_signed_offset_byte = function (value) {
            value &= 0xff;
            if (value & 0x80) {
                value = -((0xff & ~value) + 1);
            }
            return value;
        };
        let get_flags_register = function () {
            return (flags.S << 7) |
                (flags.Z << 6) |
                (flags.Y << 5) |
                (flags.H << 4) |
                (flags.X << 3) |
                (flags.P << 2) |
                (flags.N << 1) |
                (flags.C);
        };
        let get_flags_prime = function () {
            return (flags_prime.S << 7) |
                (flags_prime.Z << 6) |
                (flags_prime.Y << 5) |
                (flags_prime.H << 4) |
                (flags_prime.X << 3) |
                (flags_prime.P << 2) |
                (flags_prime.N << 1) |
                (flags_prime.C);
        };
        let set_flags_register = function (operand) {
            flags.S = (operand & 0x80) >>> 7;
            flags.Z = (operand & 0x40) >>> 6;
            flags.Y = (operand & 0x20) >>> 5;
            flags.H = (operand & 0x10) >>> 4;
            flags.X = (operand & 0x08) >>> 3;
            flags.P = (operand & 0x04) >>> 2;
            flags.N = (operand & 0x02) >>> 1;
            flags.C = (operand & 0x01);
        };
        let set_flags_prime = function (operand) {
            flags_prime.S = (operand & 0x80) >>> 7;
            flags_prime.Z = (operand & 0x40) >>> 6;
            flags_prime.Y = (operand & 0x20) >>> 5;
            flags_prime.H = (operand & 0x10) >>> 4;
            flags_prime.X = (operand & 0x08) >>> 3;
            flags_prime.P = (operand & 0x04) >>> 2;
            flags_prime.N = (operand & 0x02) >>> 1;
            flags_prime.C = (operand & 0x01);
        };
        let update_xy_flags = function (result) {
            flags.Y = (result & 0x20) >>> 5;
            flags.X = (result & 0x08) >>> 3;
        };
        let get_parity = function (value) {
            var parity_bits = [
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0,
                1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1
            ];
            return parity_bits[value];
        };
        let push_word = function (operand) {
            sp = (sp - 1) & 0xffff;
            core.mem_write(sp, (operand & 0xff00) >>> 8);
            sp = (sp - 1) & 0xffff;
            core.mem_write(sp, operand & 0x00ff);
        };
        let pop_word = function () {
            var retval = core.mem_read(sp) & 0xff;
            sp = (sp + 1) & 0xffff;
            retval |= core.mem_read(sp) << 8;
            sp = (sp + 1) & 0xffff;
            return retval;
        };
        let do_conditional_absolute_jump = function (condition) {
            if (condition) {
                pc = core.mem_read((pc + 1) & 0xffff) |
                    (core.mem_read((pc + 2) & 0xffff) << 8);
                pc = (pc - 1) & 0xffff;
            }
            else {
                pc = (pc + 2) & 0xffff;
            }
        };
        let do_conditional_relative_jump = function (condition) {
            if (condition) {
                cycle_counter += 5;
                var offset = get_signed_offset_byte(core.mem_read((pc + 1) & 0xffff));
                pc = (pc + offset + 1) & 0xffff;
            }
            else {
                pc = (pc + 1) & 0xffff;
            }
        };
        let do_conditional_call = function (condition) {
            if (condition) {
                cycle_counter += 7;
                push_word((pc + 3) & 0xffff);
                pc = core.mem_read((pc + 1) & 0xffff) |
                    (core.mem_read((pc + 2) & 0xffff) << 8);
                pc = (pc - 1) & 0xffff;
            }
            else {
                pc = (pc + 2) & 0xffff;
            }
        };
        let do_conditional_return = function (condition) {
            if (condition) {
                cycle_counter += 6;
                pc = (pop_word() - 1) & 0xffff;
            }
        };
        let do_reset = function (address) {
            push_word((pc + 1) & 0xffff);
            pc = (address - 1) & 0xffff;
        };
        let do_add = function (operand) {
            var result = a + operand;
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = !(result & 0xff) ? 1 : 0;
            flags.H = (((operand & 0x0f) + (a & 0x0f)) & 0x10) ? 1 : 0;
            flags.P = ((a & 0x80) === (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
            flags.N = 0;
            flags.C = (result & 0x100) ? 1 : 0;
            a = result & 0xff;
            update_xy_flags(a);
        };
        let do_adc = function (operand) {
            var result = a + operand + flags.C;
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = !(result & 0xff) ? 1 : 0;
            flags.H = (((operand & 0x0f) + (a & 0x0f) + flags.C) & 0x10) ? 1 : 0;
            flags.P = ((a & 0x80) === (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
            flags.N = 0;
            flags.C = (result & 0x100) ? 1 : 0;
            a = result & 0xff;
            update_xy_flags(a);
        };
        let do_sub = function (operand) {
            var result = a - operand;
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = !(result & 0xff) ? 1 : 0;
            flags.H = (((a & 0x0f) - (operand & 0x0f)) & 0x10) ? 1 : 0;
            flags.P = ((a & 0x80) !== (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
            flags.N = 1;
            flags.C = (result & 0x100) ? 1 : 0;
            a = result & 0xff;
            update_xy_flags(a);
        };
        let do_sbc = function (operand) {
            var result = a - operand - flags.C;
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = !(result & 0xff) ? 1 : 0;
            flags.H = (((a & 0x0f) - (operand & 0x0f) - flags.C) & 0x10) ? 1 : 0;
            flags.P = ((a & 0x80) !== (operand & 0x80)) && ((a & 0x80) !== (result & 0x80)) ? 1 : 0;
            flags.N = 1;
            flags.C = (result & 0x100) ? 1 : 0;
            a = result & 0xff;
            update_xy_flags(a);
        };
        let do_cp = function (operand) {
            var temp = a;
            do_sub(operand);
            a = temp;
            update_xy_flags(operand);
        };
        let do_and = function (operand) {
            a &= operand & 0xff;
            flags.S = (a & 0x80) ? 1 : 0;
            flags.Z = !a ? 1 : 0;
            flags.H = 1;
            flags.P = get_parity(a);
            flags.N = 0;
            flags.C = 0;
            update_xy_flags(a);
        };
        let do_or = function (operand) {
            a = (operand | a) & 0xff;
            flags.S = (a & 0x80) ? 1 : 0;
            flags.Z = !a ? 1 : 0;
            flags.H = 0;
            flags.P = get_parity(a);
            flags.N = 0;
            flags.C = 0;
            update_xy_flags(a);
        };
        let do_xor = function (operand) {
            a = (operand ^ a) & 0xff;
            flags.S = (a & 0x80) ? 1 : 0;
            flags.Z = !a ? 1 : 0;
            flags.H = 0;
            flags.P = get_parity(a);
            flags.N = 0;
            flags.C = 0;
            update_xy_flags(a);
        };
        let do_inc = function (operand) {
            var result = operand + 1;
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = !(result & 0xff) ? 1 : 0;
            flags.H = ((operand & 0x0f) === 0x0f) ? 1 : 0;
            flags.P = (operand === 0x7f) ? 1 : 0;
            flags.N = 0;
            result &= 0xff;
            update_xy_flags(result);
            return result;
        };
        let do_dec = function (operand) {
            var result = operand - 1;
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = !(result & 0xff) ? 1 : 0;
            flags.H = ((operand & 0x0f) === 0x00) ? 1 : 0;
            flags.P = (operand === 0x80) ? 1 : 0;
            flags.N = 1;
            result &= 0xff;
            update_xy_flags(result);
            return result;
        };
        let do_hl_add = function (operand) {
            var hl = l | (h << 8), result = hl + operand;
            flags.N = 0;
            flags.C = (result & 0x10000) ? 1 : 0;
            flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            update_xy_flags(h);
        };
        let do_hl_adc = function (operand) {
            operand += flags.C;
            var hl = l | (h << 8), result = hl + operand;
            flags.S = (result & 0x8000) ? 1 : 0;
            flags.Z = !(result & 0xffff) ? 1 : 0;
            flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
            flags.P = ((hl & 0x8000) === (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
            flags.N = 0;
            flags.C = (result & 0x10000) ? 1 : 0;
            l = result & 0xff;
            h = (result >>> 8) & 0xff;
            update_xy_flags(h);
        };
        let do_hl_sbc = function (operand) {
            operand += flags.C;
            var hl = l | (h << 8), result = hl - operand;
            flags.S = (result & 0x8000) ? 1 : 0;
            flags.Z = !(result & 0xffff) ? 1 : 0;
            flags.H = (((hl & 0x0fff) - (operand & 0x0fff)) & 0x1000) ? 1 : 0;
            flags.P = ((hl & 0x8000) !== (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
            flags.N = 1;
            flags.C = (result & 0x10000) ? 1 : 0;
            l = result & 0xff;
            h = (result >>> 8) & 0xff;
            update_xy_flags(h);
        };
        let do_in = function (port) {
            var result = core.io_read(port);
            flags.S = (result & 0x80) ? 1 : 0;
            flags.Z = result ? 0 : 1;
            flags.H = 0;
            flags.P = get_parity(result) ? 1 : 0;
            flags.N = 0;
            update_xy_flags(result);
            return result;
        };
        let do_neg = function () {
            if (a !== 0x80) {
                a = get_signed_offset_byte(a);
                a = (-a) & 0xff;
            }
            flags.S = (a & 0x80) ? 1 : 0;
            flags.Z = !a ? 1 : 0;
            flags.H = (((-a) & 0x0f) > 0) ? 1 : 0;
            flags.P = (a === 0x80) ? 1 : 0;
            flags.N = 1;
            flags.C = a ? 1 : 0;
            update_xy_flags(a);
        };
        let do_ldi = function () {
            var read_value = core.mem_read(l | (h << 8));
            core.mem_write(e | (d << 8), read_value);
            var result = (e | (d << 8)) + 1;
            e = result & 0xff;
            d = (result & 0xff00) >>> 8;
            result = (l | (h << 8)) + 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            result = (c | (b << 8)) - 1;
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
            flags.H = 0;
            flags.P = (c || b) ? 1 : 0;
            flags.N = 0;
            flags.Y = ((a + read_value) & 0x02) >>> 1;
            flags.X = ((a + read_value) & 0x08) >>> 3;
        };
        let do_cpi = function () {
            var temp_carry = flags.C;
            var read_value = core.mem_read(l | (h << 8));
            do_cp(read_value);
            flags.C = temp_carry;
            flags.Y = ((a - read_value - flags.H) & 0x02) >>> 1;
            flags.X = ((a - read_value - flags.H) & 0x08) >>> 3;
            var result = (l | (h << 8)) + 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            result = (c | (b << 8)) - 1;
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
            flags.P = result ? 1 : 0;
        };
        let do_ini = function () {
            b = do_dec(b);
            core.mem_write(l | (h << 8), core.io_read((b << 8) | c));
            var result = (l | (h << 8)) + 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            flags.N = 1;
        };
        let do_outi = function () {
            core.io_write((b << 8) | c, core.mem_read(l | (h << 8)));
            var result = (l | (h << 8)) + 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            b = do_dec(b);
            flags.N = 1;
        };
        let do_ldd = function () {
            flags.N = 0;
            flags.H = 0;
            var read_value = core.mem_read(l | (h << 8));
            core.mem_write(e | (d << 8), read_value);
            var result = (e | (d << 8)) - 1;
            e = result & 0xff;
            d = (result & 0xff00) >>> 8;
            result = (l | (h << 8)) - 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            result = (c | (b << 8)) - 1;
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
            flags.P = (c || b) ? 1 : 0;
            flags.Y = ((a + read_value) & 0x02) >>> 1;
            flags.X = ((a + read_value) & 0x08) >>> 3;
        };
        let do_cpd = function () {
            var temp_carry = flags.C;
            var read_value = core.mem_read(l | (h << 8));
            do_cp(read_value);
            flags.C = temp_carry;
            flags.Y = ((a - read_value - flags.H) & 0x02) >>> 1;
            flags.X = ((a - read_value - flags.H) & 0x08) >>> 3;
            var result = (l | (h << 8)) - 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            result = (c | (b << 8)) - 1;
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
            flags.P = result ? 1 : 0;
        };
        let do_ind = function () {
            b = do_dec(b);
            core.mem_write(l | (h << 8), core.io_read((b << 8) | c));
            var result = (l | (h << 8)) - 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            flags.N = 1;
        };
        let do_outd = function () {
            core.io_write((b << 8) | c, core.mem_read(l | (h << 8)));
            var result = (l | (h << 8)) - 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
            b = do_dec(b);
            flags.N = 1;
        };
        let do_rlc = function (operand) {
            flags.N = 0;
            flags.H = 0;
            flags.C = (operand & 0x80) >>> 7;
            operand = ((operand << 1) | flags.C) & 0xff;
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_rrc = function (operand) {
            flags.N = 0;
            flags.H = 0;
            flags.C = operand & 1;
            operand = ((operand >>> 1) & 0x7f) | (flags.C << 7);
            flags.Z = !(operand & 0xff) ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand & 0xff;
        };
        let do_rl = function (operand) {
            flags.N = 0;
            flags.H = 0;
            var temp = flags.C;
            flags.C = (operand & 0x80) >>> 7;
            operand = ((operand << 1) | temp) & 0xff;
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_rr = function (operand) {
            flags.N = 0;
            flags.H = 0;
            var temp = flags.C;
            flags.C = operand & 1;
            operand = ((operand >>> 1) & 0x7f) | (temp << 7);
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_sla = function (operand) {
            flags.N = 0;
            flags.H = 0;
            flags.C = (operand & 0x80) >>> 7;
            operand = (operand << 1) & 0xff;
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_sra = function (operand) {
            flags.N = 0;
            flags.H = 0;
            flags.C = operand & 1;
            operand = ((operand >>> 1) & 0x7f) | (operand & 0x80);
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_sll = function (operand) {
            flags.N = 0;
            flags.H = 0;
            flags.C = (operand & 0x80) >>> 7;
            operand = ((operand << 1) & 0xff) | 1;
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = (operand & 0x80) ? 1 : 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_srl = function (operand) {
            flags.N = 0;
            flags.H = 0;
            flags.C = operand & 1;
            operand = (operand >>> 1) & 0x7f;
            flags.Z = !operand ? 1 : 0;
            flags.P = get_parity(operand);
            flags.S = 0;
            update_xy_flags(operand);
            return operand;
        };
        let do_ix_add = function (operand) {
            flags.N = 0;
            var result = ix + operand;
            flags.C = (result & 0x10000) ? 1 : 0;
            flags.H = (((ix & 0xfff) + (operand & 0xfff)) & 0x1000) ? 1 : 0;
            update_xy_flags((result & 0xff00) >>> 8);
            ix = result;
        };
        let instructions = [];
        instructions[0x00] = function () { };
        instructions[0x01] = function () {
            pc = (pc + 1) & 0xffff;
            c = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            b = core.mem_read(pc);
        };
        instructions[0x02] = function () {
            core.mem_write(c | (b << 8), a);
        };
        instructions[0x03] = function () {
            var result = (c | (b << 8));
            result += 1;
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
        };
        instructions[0x04] = function () {
            b = do_inc(b);
        };
        instructions[0x05] = function () {
            b = do_dec(b);
        };
        instructions[0x06] = function () {
            pc = (pc + 1) & 0xffff;
            b = core.mem_read(pc);
        };
        instructions[0x07] = function () {
            var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
            a = do_rlc(a);
            flags.S = temp_s;
            flags.Z = temp_z;
            flags.P = temp_p;
        };
        instructions[0x08] = function () {
            var temp = a;
            a = a_prime;
            a_prime = temp;
            temp = get_flags_register();
            set_flags_register(get_flags_prime());
            set_flags_prime(temp);
        };
        instructions[0x09] = function () {
            do_hl_add(c | (b << 8));
        };
        instructions[0x0a] = function () {
            a = core.mem_read(c | (b << 8));
        };
        instructions[0x0b] = function () {
            var result = (c | (b << 8));
            result -= 1;
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
        };
        instructions[0x0c] = function () {
            c = do_inc(c);
        };
        instructions[0x0d] = function () {
            c = do_dec(c);
        };
        instructions[0x0e] = function () {
            pc = (pc + 1) & 0xffff;
            c = core.mem_read(pc);
        };
        instructions[0x0f] = function () {
            var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
            a = do_rrc(a);
            flags.S = temp_s;
            flags.Z = temp_z;
            flags.P = temp_p;
        };
        instructions[0x10] = function () {
            b = (b - 1) & 0xff;
            do_conditional_relative_jump(b !== 0);
        };
        instructions[0x11] = function () {
            pc = (pc + 1) & 0xffff;
            e = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            d = core.mem_read(pc);
        };
        instructions[0x12] = function () {
            core.mem_write(e | (d << 8), a);
        };
        instructions[0x13] = function () {
            var result = (e | (d << 8));
            result += 1;
            e = result & 0xff;
            d = (result & 0xff00) >>> 8;
        };
        instructions[0x14] = function () {
            d = do_inc(d);
        };
        instructions[0x15] = function () {
            d = do_dec(d);
        };
        instructions[0x16] = function () {
            pc = (pc + 1) & 0xffff;
            d = core.mem_read(pc);
        };
        instructions[0x17] = function () {
            var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
            a = do_rl(a);
            flags.S = temp_s;
            flags.Z = temp_z;
            flags.P = temp_p;
        };
        instructions[0x18] = function () {
            var offset = get_signed_offset_byte(core.mem_read((pc + 1) & 0xffff));
            pc = (pc + offset + 1) & 0xffff;
        };
        instructions[0x19] = function () {
            do_hl_add(e | (d << 8));
        };
        instructions[0x1a] = function () {
            a = core.mem_read(e | (d << 8));
        };
        instructions[0x1b] = function () {
            var result = (e | (d << 8));
            result -= 1;
            e = result & 0xff;
            d = (result & 0xff00) >>> 8;
        };
        instructions[0x1c] = function () {
            e = do_inc(e);
        };
        instructions[0x1d] = function () {
            e = do_dec(e);
        };
        instructions[0x1e] = function () {
            pc = (pc + 1) & 0xffff;
            e = core.mem_read(pc);
        };
        instructions[0x1f] = function () {
            var temp_s = flags.S, temp_z = flags.Z, temp_p = flags.P;
            a = do_rr(a);
            flags.S = temp_s;
            flags.Z = temp_z;
            flags.P = temp_p;
        };
        instructions[0x20] = function () {
            do_conditional_relative_jump(!flags.Z);
        };
        instructions[0x21] = function () {
            pc = (pc + 1) & 0xffff;
            l = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            h = core.mem_read(pc);
        };
        instructions[0x22] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            core.mem_write(address, l);
            core.mem_write((address + 1) & 0xffff, h);
        };
        instructions[0x23] = function () {
            var result = (l | (h << 8));
            result += 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
        };
        instructions[0x24] = function () {
            h = do_inc(h);
        };
        instructions[0x25] = function () {
            h = do_dec(h);
        };
        instructions[0x26] = function () {
            pc = (pc + 1) & 0xffff;
            h = core.mem_read(pc);
        };
        instructions[0x27] = function () {
            var temp = a;
            if (!flags.N) {
                if (flags.H || ((a & 0x0f) > 9))
                    temp += 0x06;
                if (flags.C || (a > 0x99))
                    temp += 0x60;
            }
            else {
                if (flags.H || ((a & 0x0f) > 9))
                    temp -= 0x06;
                if (flags.C || (a > 0x99))
                    temp -= 0x60;
            }
            flags.S = (temp & 0x80) ? 1 : 0;
            flags.Z = !(temp & 0xff) ? 1 : 0;
            flags.H = ((a & 0x10) ^ (temp & 0x10)) ? 1 : 0;
            flags.P = get_parity(temp & 0xff);
            flags.C = (flags.C || (a > 0x99)) ? 1 : 0;
            a = temp & 0xff;
            update_xy_flags(a);
        };
        instructions[0x28] = function () {
            do_conditional_relative_jump(!!flags.Z);
        };
        instructions[0x29] = function () {
            do_hl_add(l | (h << 8));
        };
        instructions[0x2a] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            l = core.mem_read(address);
            h = core.mem_read((address + 1) & 0xffff);
        };
        instructions[0x2b] = function () {
            var result = (l | (h << 8));
            result -= 1;
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
        };
        instructions[0x2c] = function () {
            l = do_inc(l);
        };
        instructions[0x2d] = function () {
            l = do_dec(l);
        };
        instructions[0x2e] = function () {
            pc = (pc + 1) & 0xffff;
            l = core.mem_read(pc);
        };
        instructions[0x2f] = function () {
            a = (~a) & 0xff;
            flags.N = 1;
            flags.H = 1;
            update_xy_flags(a);
        };
        instructions[0x30] = function () {
            do_conditional_relative_jump(!flags.C);
        };
        instructions[0x31] = function () {
            sp = core.mem_read((pc + 1) & 0xffff) |
                (core.mem_read((pc + 2) & 0xffff) << 8);
            pc = (pc + 2) & 0xffff;
        };
        instructions[0x32] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            core.mem_write(address, a);
        };
        instructions[0x33] = function () {
            sp = (sp + 1) & 0xffff;
        };
        instructions[0x34] = function () {
            var address = l | (h << 8);
            core.mem_write(address, do_inc(core.mem_read(address)));
        };
        instructions[0x35] = function () {
            var address = l | (h << 8);
            core.mem_write(address, do_dec(core.mem_read(address)));
        };
        instructions[0x36] = function () {
            pc = (pc + 1) & 0xffff;
            core.mem_write(l | (h << 8), core.mem_read(pc));
        };
        instructions[0x37] = function () {
            flags.N = 0;
            flags.H = 0;
            flags.C = 1;
            update_xy_flags(a);
        };
        instructions[0x38] = function () {
            do_conditional_relative_jump(!!flags.C);
        };
        instructions[0x39] = function () {
            do_hl_add(sp);
        };
        instructions[0x3a] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            a = core.mem_read(address);
        };
        instructions[0x3b] = function () {
            sp = (sp - 1) & 0xffff;
        };
        instructions[0x3c] = function () {
            a = do_inc(a);
        };
        instructions[0x3d] = function () {
            a = do_dec(a);
        };
        instructions[0x3e] = function () {
            a = core.mem_read((pc + 1) & 0xffff);
            pc = (pc + 1) & 0xffff;
        };
        instructions[0x3f] = function () {
            flags.N = 0;
            flags.H = flags.C;
            flags.C = flags.C ? 0 : 1;
            update_xy_flags(a);
        };
        instructions[0xc0] = function () {
            do_conditional_return(!flags.Z);
        };
        instructions[0xc1] = function () {
            var result = pop_word();
            c = result & 0xff;
            b = (result & 0xff00) >>> 8;
        };
        instructions[0xc2] = function () {
            do_conditional_absolute_jump(!flags.Z);
        };
        instructions[0xc3] = function () {
            pc = core.mem_read((pc + 1) & 0xffff) |
                (core.mem_read((pc + 2) & 0xffff) << 8);
            pc = (pc - 1) & 0xffff;
        };
        instructions[0xc4] = function () {
            do_conditional_call(!flags.Z);
        };
        instructions[0xc5] = function () {
            push_word(c | (b << 8));
        };
        instructions[0xc6] = function () {
            pc = (pc + 1) & 0xffff;
            do_add(core.mem_read(pc));
        };
        instructions[0xc7] = function () {
            do_reset(0x00);
        };
        instructions[0xc8] = function () {
            do_conditional_return(!!flags.Z);
        };
        instructions[0xc9] = function () {
            pc = (pop_word() - 1) & 0xffff;
        };
        instructions[0xca] = function () {
            do_conditional_absolute_jump(!!flags.Z);
        };
        instructions[0xcb] = function () {
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            pc = (pc + 1) & 0xffff;
            var opcode = core.mem_read(pc), bit_number = (opcode & 0x38) >>> 3, reg_code = opcode & 0x07;
            if (opcode < 0x40) {
                var op_array = [do_rlc, do_rrc, do_rl, do_rr,
                    do_sla, do_sra, do_sll, do_srl];
                if (reg_code === 0)
                    b = op_array[bit_number](b);
                else if (reg_code === 1)
                    c = op_array[bit_number](c);
                else if (reg_code === 2)
                    d = op_array[bit_number](d);
                else if (reg_code === 3)
                    e = op_array[bit_number](e);
                else if (reg_code === 4)
                    h = op_array[bit_number](h);
                else if (reg_code === 5)
                    l = op_array[bit_number](l);
                else if (reg_code === 6)
                    core.mem_write(l | (h << 8), op_array[bit_number](core.mem_read(l | (h << 8))));
                else if (reg_code === 7)
                    a = op_array[bit_number](a);
            }
            else if (opcode < 0x80) {
                if (reg_code === 0)
                    flags.Z = !(b & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 1)
                    flags.Z = !(c & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 2)
                    flags.Z = !(d & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 3)
                    flags.Z = !(e & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 4)
                    flags.Z = !(h & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 5)
                    flags.Z = !(l & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 6)
                    flags.Z = !((core.mem_read(l | (h << 8))) & (1 << bit_number)) ? 1 : 0;
                else if (reg_code === 7)
                    flags.Z = !(a & (1 << bit_number)) ? 1 : 0;
                flags.N = 0;
                flags.H = 1;
                flags.P = flags.Z;
                flags.S = ((bit_number === 7) && !flags.Z) ? 1 : 0;
                flags.Y = ((bit_number === 5) && !flags.Z) ? 1 : 0;
                flags.X = ((bit_number === 3) && !flags.Z) ? 1 : 0;
            }
            else if (opcode < 0xc0) {
                if (reg_code === 0)
                    b &= (0xff & ~(1 << bit_number));
                else if (reg_code === 1)
                    c &= (0xff & ~(1 << bit_number));
                else if (reg_code === 2)
                    d &= (0xff & ~(1 << bit_number));
                else if (reg_code === 3)
                    e &= (0xff & ~(1 << bit_number));
                else if (reg_code === 4)
                    h &= (0xff & ~(1 << bit_number));
                else if (reg_code === 5)
                    l &= (0xff & ~(1 << bit_number));
                else if (reg_code === 6)
                    core.mem_write(l | (h << 8), core.mem_read(l | (h << 8)) & ~(1 << bit_number));
                else if (reg_code === 7)
                    a &= (0xff & ~(1 << bit_number));
            }
            else {
                if (reg_code === 0)
                    b |= (1 << bit_number);
                else if (reg_code === 1)
                    c |= (1 << bit_number);
                else if (reg_code === 2)
                    d |= (1 << bit_number);
                else if (reg_code === 3)
                    e |= (1 << bit_number);
                else if (reg_code === 4)
                    h |= (1 << bit_number);
                else if (reg_code === 5)
                    l |= (1 << bit_number);
                else if (reg_code === 6)
                    core.mem_write(l | (h << 8), core.mem_read(l | (h << 8)) | (1 << bit_number));
                else if (reg_code === 7)
                    a |= (1 << bit_number);
            }
            cycle_counter += cycle_counts_cb[opcode];
        };
        instructions[0xcc] = function () {
            do_conditional_call(!!flags.Z);
        };
        instructions[0xcd] = function () {
            push_word((pc + 3) & 0xffff);
            pc = core.mem_read((pc + 1) & 0xffff) |
                (core.mem_read((pc + 2) & 0xffff) << 8);
            pc = (pc - 1) & 0xffff;
        };
        instructions[0xce] = function () {
            pc = (pc + 1) & 0xffff;
            do_adc(core.mem_read(pc));
        };
        instructions[0xcf] = function () {
            do_reset(0x08);
        };
        instructions[0xd0] = function () {
            do_conditional_return(!flags.C);
        };
        instructions[0xd1] = function () {
            var result = pop_word();
            e = result & 0xff;
            d = (result & 0xff00) >>> 8;
        };
        instructions[0xd2] = function () {
            do_conditional_absolute_jump(!flags.C);
        };
        instructions[0xd3] = function () {
            pc = (pc + 1) & 0xffff;
            core.io_write((a << 8) | core.mem_read(pc), a);
        };
        instructions[0xd4] = function () {
            do_conditional_call(!flags.C);
        };
        instructions[0xd5] = function () {
            push_word(e | (d << 8));
        };
        instructions[0xd6] = function () {
            pc = (pc + 1) & 0xffff;
            do_sub(core.mem_read(pc));
        };
        instructions[0xd7] = function () {
            do_reset(0x10);
        };
        instructions[0xd8] = function () {
            do_conditional_return(!!flags.C);
        };
        instructions[0xd9] = function () {
            var temp = b;
            b = b_prime;
            b_prime = temp;
            temp = c;
            c = c_prime;
            c_prime = temp;
            temp = d;
            d = d_prime;
            d_prime = temp;
            temp = e;
            e = e_prime;
            e_prime = temp;
            temp = h;
            h = h_prime;
            h_prime = temp;
            temp = l;
            l = l_prime;
            l_prime = temp;
        };
        instructions[0xda] = function () {
            do_conditional_absolute_jump(!!flags.C);
        };
        instructions[0xdb] = function () {
            pc = (pc + 1) & 0xffff;
            a = core.io_read((a << 8) | core.mem_read(pc));
        };
        instructions[0xdc] = function () {
            do_conditional_call(!!flags.C);
        };
        instructions[0xdd] = function () {
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            pc = (pc + 1) & 0xffff;
            var opcode = core.mem_read(pc), func = dd_instructions[opcode];
            if (func) {
                func();
                cycle_counter += cycle_counts_dd[opcode];
            }
            else {
                pc = (pc - 1) & 0xffff;
                cycle_counter += cycle_counts[0];
            }
        };
        instructions[0xde] = function () {
            pc = (pc + 1) & 0xffff;
            do_sbc(core.mem_read(pc));
        };
        instructions[0xdf] = function () {
            do_reset(0x18);
        };
        instructions[0xe0] = function () {
            do_conditional_return(!flags.P);
        };
        instructions[0xe1] = function () {
            var result = pop_word();
            l = result & 0xff;
            h = (result & 0xff00) >>> 8;
        };
        instructions[0xe2] = function () {
            do_conditional_absolute_jump(!flags.P);
        };
        instructions[0xe3] = function () {
            var temp = core.mem_read(sp);
            core.mem_write(sp, l);
            l = temp;
            temp = core.mem_read((sp + 1) & 0xffff);
            core.mem_write((sp + 1) & 0xffff, h);
            h = temp;
        };
        instructions[0xe4] = function () {
            do_conditional_call(!flags.P);
        };
        instructions[0xe5] = function () {
            push_word(l | (h << 8));
        };
        instructions[0xe6] = function () {
            pc = (pc + 1) & 0xffff;
            do_and(core.mem_read(pc));
        };
        instructions[0xe7] = function () {
            do_reset(0x20);
        };
        instructions[0xe8] = function () {
            do_conditional_return(!!flags.P);
        };
        instructions[0xe9] = function () {
            pc = l | (h << 8);
            pc = (pc - 1) & 0xffff;
        };
        instructions[0xea] = function () {
            do_conditional_absolute_jump(!!flags.P);
        };
        instructions[0xeb] = function () {
            var temp = d;
            d = h;
            h = temp;
            temp = e;
            e = l;
            l = temp;
        };
        instructions[0xec] = function () {
            do_conditional_call(!!flags.P);
        };
        instructions[0xed] = function () {
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            pc = (pc + 1) & 0xffff;
            var opcode = core.mem_read(pc), func = ed_instructions[opcode];
            if (func) {
                func();
                cycle_counter += cycle_counts_ed[opcode];
            }
            else {
                cycle_counter += cycle_counts[0];
            }
        };
        instructions[0xee] = function () {
            pc = (pc + 1) & 0xffff;
            do_xor(core.mem_read(pc));
        };
        instructions[0xef] = function () {
            do_reset(0x28);
        };
        instructions[0xf0] = function () {
            do_conditional_return(!flags.S);
        };
        instructions[0xf1] = function () {
            var result = pop_word();
            set_flags_register(result & 0xff);
            a = (result & 0xff00) >>> 8;
        };
        instructions[0xf2] = function () {
            do_conditional_absolute_jump(!flags.S);
        };
        instructions[0xf3] = function () {
            do_delayed_di = true;
        };
        instructions[0xf4] = function () {
            do_conditional_call(!flags.S);
        };
        instructions[0xf5] = function () {
            push_word(get_flags_register() | (a << 8));
        };
        instructions[0xf6] = function () {
            pc = (pc + 1) & 0xffff;
            do_or(core.mem_read(pc));
        };
        instructions[0xf7] = function () {
            do_reset(0x30);
        };
        instructions[0xf8] = function () {
            do_conditional_return(!!flags.S);
        };
        instructions[0xf9] = function () {
            sp = l | (h << 8);
        };
        instructions[0xfa] = function () {
            do_conditional_absolute_jump(!!flags.S);
        };
        instructions[0xfb] = function () {
            do_delayed_ei = true;
        };
        instructions[0xfc] = function () {
            do_conditional_call(!!flags.S);
        };
        instructions[0xfd] = function () {
            r = (r & 0x80) | (((r & 0x7f) + 1) & 0x7f);
            pc = (pc + 1) & 0xffff;
            var opcode = core.mem_read(pc), func = dd_instructions[opcode];
            if (func) {
                var temp = ix;
                ix = iy;
                func();
                iy = ix;
                ix = temp;
                cycle_counter += cycle_counts_dd[opcode];
            }
            else {
                pc = (pc - 1) & 0xffff;
                cycle_counter += cycle_counts[0];
            }
        };
        instructions[0xfe] = function () {
            pc = (pc + 1) & 0xffff;
            do_cp(core.mem_read(pc));
        };
        instructions[0xff] = function () {
            do_reset(0x38);
        };
        let ed_instructions = [];
        ed_instructions[0x40] = function () {
            b = do_in((b << 8) | c);
        };
        ed_instructions[0x41] = function () {
            core.io_write((b << 8) | c, b);
        };
        ed_instructions[0x42] = function () {
            do_hl_sbc(c | (b << 8));
        };
        ed_instructions[0x43] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            core.mem_write(address, c);
            core.mem_write((address + 1) & 0xffff, b);
        };
        ed_instructions[0x44] = function () {
            do_neg();
        };
        ed_instructions[0x45] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x46] = function () {
            imode = 0;
        };
        ed_instructions[0x47] = function () {
            i = a;
        };
        ed_instructions[0x48] = function () {
            c = do_in((b << 8) | c);
        };
        ed_instructions[0x49] = function () {
            core.io_write((b << 8) | c, c);
        };
        ed_instructions[0x4a] = function () {
            do_hl_adc(c | (b << 8));
        };
        ed_instructions[0x4b] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            c = core.mem_read(address);
            b = core.mem_read((address + 1) & 0xffff);
        };
        ed_instructions[0x4c] = function () {
            do_neg();
        };
        ed_instructions[0x4d] = function () {
            pc = (pop_word() - 1) & 0xffff;
        };
        ed_instructions[0x4e] = function () {
            imode = 0;
        };
        ed_instructions[0x4f] = function () {
            r = a;
        };
        ed_instructions[0x50] = function () {
            d = do_in((b << 8) | c);
        };
        ed_instructions[0x51] = function () {
            core.io_write((b << 8) | c, d);
        };
        ed_instructions[0x52] = function () {
            do_hl_sbc(e | (d << 8));
        };
        ed_instructions[0x53] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            core.mem_write(address, e);
            core.mem_write((address + 1) & 0xffff, d);
        };
        ed_instructions[0x54] = function () {
            do_neg();
        };
        ed_instructions[0x55] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x56] = function () {
            imode = 1;
        };
        ed_instructions[0x57] = function () {
            a = i;
            flags.S = a & 0x80 ? 1 : 0;
            flags.Z = a ? 0 : 1;
            flags.H = 0;
            flags.P = iff2;
            flags.N = 0;
            update_xy_flags(a);
        };
        ed_instructions[0x58] = function () {
            e = do_in((b << 8) | c);
        };
        ed_instructions[0x59] = function () {
            core.io_write((b << 8) | c, e);
        };
        ed_instructions[0x5a] = function () {
            do_hl_adc(e | (d << 8));
        };
        ed_instructions[0x5b] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            e = core.mem_read(address);
            d = core.mem_read((address + 1) & 0xffff);
        };
        ed_instructions[0x5c] = function () {
            do_neg();
        };
        ed_instructions[0x5d] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x5e] = function () {
            imode = 2;
        };
        ed_instructions[0x5f] = function () {
            a = r;
            flags.S = a & 0x80 ? 1 : 0;
            flags.Z = a ? 0 : 1;
            flags.H = 0;
            flags.P = iff2;
            flags.N = 0;
            update_xy_flags(a);
        };
        ed_instructions[0x60] = function () {
            h = do_in((b << 8) | c);
        };
        ed_instructions[0x61] = function () {
            core.io_write((b << 8) | c, h);
        };
        ed_instructions[0x62] = function () {
            do_hl_sbc(l | (h << 8));
        };
        ed_instructions[0x63] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            core.mem_write(address, l);
            core.mem_write((address + 1) & 0xffff, h);
        };
        ed_instructions[0x64] = function () {
            do_neg();
        };
        ed_instructions[0x65] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x66] = function () {
            imode = 0;
        };
        ed_instructions[0x67] = function () {
            var hl_value = core.mem_read(l | (h << 8));
            var temp1 = hl_value & 0x0f, temp2 = a & 0x0f;
            hl_value = ((hl_value & 0xf0) >>> 4) | (temp2 << 4);
            a = (a & 0xf0) | temp1;
            core.mem_write(l | (h << 8), hl_value);
            flags.S = (a & 0x80) ? 1 : 0;
            flags.Z = a ? 0 : 1;
            flags.H = 0;
            flags.P = get_parity(a) ? 1 : 0;
            flags.N = 0;
            update_xy_flags(a);
        };
        ed_instructions[0x68] = function () {
            l = do_in((b << 8) | c);
        };
        ed_instructions[0x69] = function () {
            core.io_write((b << 8) | c, l);
        };
        ed_instructions[0x6a] = function () {
            do_hl_adc(l | (h << 8));
        };
        ed_instructions[0x6b] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            l = core.mem_read(address);
            h = core.mem_read((address + 1) & 0xffff);
        };
        ed_instructions[0x6c] = function () {
            do_neg();
        };
        ed_instructions[0x6d] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x6e] = function () {
            imode = 0;
        };
        ed_instructions[0x6f] = function () {
            var hl_value = core.mem_read(l | (h << 8));
            var temp1 = hl_value & 0xf0, temp2 = a & 0x0f;
            hl_value = ((hl_value & 0x0f) << 4) | temp2;
            a = (a & 0xf0) | (temp1 >>> 4);
            core.mem_write(l | (h << 8), hl_value);
            flags.S = (a & 0x80) ? 1 : 0;
            flags.Z = a ? 0 : 1;
            flags.H = 0;
            flags.P = get_parity(a) ? 1 : 0;
            flags.N = 0;
            update_xy_flags(a);
        };
        ed_instructions[0x70] = function () {
            do_in((b << 8) | c);
        };
        ed_instructions[0x71] = function () {
            core.io_write((b << 8) | c, 0);
        };
        ed_instructions[0x72] = function () {
            do_hl_sbc(sp);
        };
        ed_instructions[0x73] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            core.mem_write(address, sp & 0xff);
            core.mem_write((address + 1) & 0xffff, (sp >>> 8) & 0xff);
        };
        ed_instructions[0x74] = function () {
            do_neg();
        };
        ed_instructions[0x75] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x76] = function () {
            imode = 1;
        };
        ed_instructions[0x78] = function () {
            a = do_in((b << 8) | c);
        };
        ed_instructions[0x79] = function () {
            core.io_write((b << 8) | c, a);
        };
        ed_instructions[0x7a] = function () {
            do_hl_adc(sp);
        };
        ed_instructions[0x7b] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= core.mem_read(pc) << 8;
            sp = core.mem_read(address);
            sp |= core.mem_read((address + 1) & 0xffff) << 8;
        };
        ed_instructions[0x7c] = function () {
            do_neg();
        };
        ed_instructions[0x7d] = function () {
            pc = (pop_word() - 1) & 0xffff;
            iff1 = iff2;
        };
        ed_instructions[0x7e] = function () {
            imode = 2;
        };
        ed_instructions[0xa0] = function () {
            do_ldi();
        };
        ed_instructions[0xa1] = function () {
            do_cpi();
        };
        ed_instructions[0xa2] = function () {
            do_ini();
        };
        ed_instructions[0xa3] = function () {
            do_outi();
        };
        ed_instructions[0xa8] = function () {
            do_ldd();
        };
        ed_instructions[0xa9] = function () {
            do_cpd();
        };
        ed_instructions[0xaa] = function () {
            do_ind();
        };
        ed_instructions[0xab] = function () {
            do_outd();
        };
        ed_instructions[0xb0] = function () {
            do_ldi();
            if (b || c) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xb1] = function () {
            do_cpi();
            if (!flags.Z && (b || c)) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xb2] = function () {
            do_ini();
            if (b) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xb3] = function () {
            do_outi();
            if (b) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xb8] = function () {
            do_ldd();
            if (b || c) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xb9] = function () {
            do_cpd();
            if (!flags.Z && (b || c)) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xba] = function () {
            do_ind();
            if (b) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        ed_instructions[0xbb] = function () {
            do_outd();
            if (b) {
                cycle_counter += 5;
                pc = (pc - 2) & 0xffff;
            }
        };
        let dd_instructions = [];
        dd_instructions[0x09] = function () {
            do_ix_add(c | (b << 8));
        };
        dd_instructions[0x19] = function () {
            do_ix_add(e | (d << 8));
        };
        dd_instructions[0x21] = function () {
            pc = (pc + 1) & 0xffff;
            ix = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            ix |= (core.mem_read(pc) << 8);
        };
        dd_instructions[0x22] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= (core.mem_read(pc) << 8);
            core.mem_write(address, ix & 0xff);
            core.mem_write((address + 1) & 0xffff, (ix >>> 8) & 0xff);
        };
        dd_instructions[0x23] = function () {
            ix = (ix + 1) & 0xffff;
        };
        dd_instructions[0x24] = function () {
            ix = (do_inc(ix >>> 8) << 8) | (ix & 0xff);
        };
        dd_instructions[0x25] = function () {
            ix = (do_dec(ix >>> 8) << 8) | (ix & 0xff);
        };
        dd_instructions[0x26] = function () {
            pc = (pc + 1) & 0xffff;
            ix = (core.mem_read(pc) << 8) | (ix & 0xff);
        };
        dd_instructions[0x29] = function () {
            do_ix_add(ix);
        };
        dd_instructions[0x2a] = function () {
            pc = (pc + 1) & 0xffff;
            var address = core.mem_read(pc);
            pc = (pc + 1) & 0xffff;
            address |= (core.mem_read(pc) << 8);
            ix = core.mem_read(address);
            ix |= (core.mem_read((address + 1) & 0xffff) << 8);
        };
        dd_instructions[0x2b] = function () {
            ix = (ix - 1) & 0xffff;
        };
        dd_instructions[0x2c] = function () {
            ix = do_inc(ix & 0xff) | (ix & 0xff00);
        };
        dd_instructions[0x2d] = function () {
            ix = do_dec(ix & 0xff) | (ix & 0xff00);
        };
        dd_instructions[0x2e] = function () {
            pc = (pc + 1) & 0xffff;
            ix = (core.mem_read(pc) & 0xff) | (ix & 0xff00);
        };
        dd_instructions[0x34] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc)), value = core.mem_read((offset + ix) & 0xffff);
            core.mem_write((offset + ix) & 0xffff, do_inc(value));
        };
        dd_instructions[0x35] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc)), value = core.mem_read((offset + ix) & 0xffff);
            core.mem_write((offset + ix) & 0xffff, do_dec(value));
        };
        dd_instructions[0x36] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            pc = (pc + 1) & 0xffff;
            core.mem_write((ix + offset) & 0xffff, core.mem_read(pc));
        };
        dd_instructions[0x39] = function () {
            do_ix_add(sp);
        };
        dd_instructions[0x44] = function () {
            b = (ix >>> 8) & 0xff;
        };
        dd_instructions[0x45] = function () {
            b = ix & 0xff;
        };
        dd_instructions[0x46] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            b = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x4c] = function () {
            c = (ix >>> 8) & 0xff;
        };
        dd_instructions[0x4d] = function () {
            c = ix & 0xff;
        };
        dd_instructions[0x4e] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            c = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x54] = function () {
            d = (ix >>> 8) & 0xff;
        };
        dd_instructions[0x55] = function () {
            d = ix & 0xff;
        };
        dd_instructions[0x56] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            d = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x5c] = function () {
            e = (ix >>> 8) & 0xff;
        };
        dd_instructions[0x5d] = function () {
            e = ix & 0xff;
        };
        dd_instructions[0x5e] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            e = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x60] = function () {
            ix = (ix & 0xff) | (b << 8);
        };
        dd_instructions[0x61] = function () {
            ix = (ix & 0xff) | (c << 8);
        };
        dd_instructions[0x62] = function () {
            ix = (ix & 0xff) | (d << 8);
        };
        dd_instructions[0x63] = function () {
            ix = (ix & 0xff) | (e << 8);
        };
        dd_instructions[0x64] = function () {
        };
        dd_instructions[0x65] = function () {
            ix = (ix & 0xff) | ((ix & 0xff) << 8);
        };
        dd_instructions[0x66] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            h = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x67] = function () {
            ix = (ix & 0xff) | (a << 8);
        };
        dd_instructions[0x68] = function () {
            ix = (ix & 0xff00) | b;
        };
        dd_instructions[0x69] = function () {
            ix = (ix & 0xff00) | c;
        };
        dd_instructions[0x6a] = function () {
            ix = (ix & 0xff00) | d;
        };
        dd_instructions[0x6b] = function () {
            ix = (ix & 0xff00) | e;
        };
        dd_instructions[0x6c] = function () {
            ix = (ix & 0xff00) | (ix >>> 8);
        };
        dd_instructions[0x6d] = function () {
        };
        dd_instructions[0x6e] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            l = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x6f] = function () {
            ix = (ix & 0xff00) | a;
        };
        dd_instructions[0x70] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, b);
        };
        dd_instructions[0x71] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, c);
        };
        dd_instructions[0x72] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, d);
        };
        dd_instructions[0x73] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, e);
        };
        dd_instructions[0x74] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, h);
        };
        dd_instructions[0x75] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, l);
        };
        dd_instructions[0x77] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            core.mem_write((ix + offset) & 0xffff, a);
        };
        dd_instructions[0x7c] = function () {
            a = (ix >>> 8) & 0xff;
        };
        dd_instructions[0x7d] = function () {
            a = ix & 0xff;
        };
        dd_instructions[0x7e] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            a = core.mem_read((ix + offset) & 0xffff);
        };
        dd_instructions[0x84] = function () {
            do_add((ix >>> 8) & 0xff);
        };
        dd_instructions[0x85] = function () {
            do_add(ix & 0xff);
        };
        dd_instructions[0x86] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_add(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0x8c] = function () {
            do_adc((ix >>> 8) & 0xff);
        };
        dd_instructions[0x8d] = function () {
            do_adc(ix & 0xff);
        };
        dd_instructions[0x8e] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_adc(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0x94] = function () {
            do_sub((ix >>> 8) & 0xff);
        };
        dd_instructions[0x95] = function () {
            do_sub(ix & 0xff);
        };
        dd_instructions[0x96] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_sub(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0x9c] = function () {
            do_sbc((ix >>> 8) & 0xff);
        };
        dd_instructions[0x9d] = function () {
            do_sbc(ix & 0xff);
        };
        dd_instructions[0x9e] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_sbc(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0xa4] = function () {
            do_and((ix >>> 8) & 0xff);
        };
        dd_instructions[0xa5] = function () {
            do_and(ix & 0xff);
        };
        dd_instructions[0xa6] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_and(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0xac] = function () {
            do_xor((ix >>> 8) & 0xff);
        };
        dd_instructions[0xad] = function () {
            do_xor(ix & 0xff);
        };
        dd_instructions[0xae] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_xor(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0xb4] = function () {
            do_or((ix >>> 8) & 0xff);
        };
        dd_instructions[0xb5] = function () {
            do_or(ix & 0xff);
        };
        dd_instructions[0xb6] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_or(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0xbc] = function () {
            do_cp((ix >>> 8) & 0xff);
        };
        dd_instructions[0xbd] = function () {
            do_cp(ix & 0xff);
        };
        dd_instructions[0xbe] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            do_cp(core.mem_read((ix + offset) & 0xffff));
        };
        dd_instructions[0xcb] = function () {
            pc = (pc + 1) & 0xffff;
            var offset = get_signed_offset_byte(core.mem_read(pc));
            pc = (pc + 1) & 0xffff;
            var opcode = core.mem_read(pc), value;
            if (opcode < 0x40) {
                var ddcb_functions = [do_rlc, do_rrc, do_rl, do_rr,
                    do_sla, do_sra, do_sll, do_srl];
                var func = ddcb_functions[(opcode & 0x38) >>> 3], value = func(core.mem_read((ix + offset) & 0xffff));
                core.mem_write((ix + offset) & 0xffff, value);
            }
            else {
                var bit_number = (opcode & 0x38) >>> 3;
                if (opcode < 0x80) {
                    flags.N = 0;
                    flags.H = 1;
                    flags.Z = !(core.mem_read((ix + offset) & 0xffff) & (1 << bit_number)) ? 1 : 0;
                    flags.P = flags.Z;
                    flags.S = ((bit_number === 7) && !flags.Z) ? 1 : 0;
                }
                else if (opcode < 0xc0) {
                    value = core.mem_read((ix + offset) & 0xffff) & ~(1 << bit_number) & 0xff;
                    core.mem_write((ix + offset) & 0xffff, value);
                }
                else {
                    value = core.mem_read((ix + offset) & 0xffff) | (1 << bit_number);
                    core.mem_write((ix + offset) & 0xffff, value);
                }
            }
            if (value !== undefined) {
                if ((opcode & 0x07) === 0)
                    b = value;
                else if ((opcode & 0x07) === 1)
                    c = value;
                else if ((opcode & 0x07) === 2)
                    d = value;
                else if ((opcode & 0x07) === 3)
                    e = value;
                else if ((opcode & 0x07) === 4)
                    h = value;
                else if ((opcode & 0x07) === 5)
                    l = value;
                else if ((opcode & 0x07) === 7)
                    a = value;
            }
            cycle_counter += cycle_counts_cb[opcode] + 8;
        };
        dd_instructions[0xe1] = function () {
            ix = pop_word();
        };
        dd_instructions[0xe3] = function () {
            var temp = ix;
            ix = core.mem_read(sp);
            ix |= core.mem_read((sp + 1) & 0xffff) << 8;
            core.mem_write(sp, temp & 0xff);
            core.mem_write((sp + 1) & 0xffff, (temp >>> 8) & 0xff);
        };
        dd_instructions[0xe5] = function () {
            push_word(ix);
        };
        dd_instructions[0xe9] = function () {
            pc = (ix - 1) & 0xffff;
        };
        dd_instructions[0xf9] = function () {
            sp = ix;
        };
        let cycle_counts = [
            4, 10, 7, 6, 4, 4, 7, 4, 4, 11, 7, 6, 4, 4, 7, 4,
            8, 10, 7, 6, 4, 4, 7, 4, 12, 11, 7, 6, 4, 4, 7, 4,
            7, 10, 16, 6, 4, 4, 7, 4, 7, 11, 16, 6, 4, 4, 7, 4,
            7, 10, 13, 6, 11, 11, 10, 4, 7, 11, 13, 6, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            7, 7, 7, 7, 7, 7, 4, 7, 4, 4, 4, 4, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            4, 4, 4, 4, 4, 4, 7, 4, 4, 4, 4, 4, 4, 4, 7, 4,
            5, 10, 10, 10, 10, 11, 7, 11, 5, 10, 10, 0, 10, 17, 7, 11,
            5, 10, 10, 11, 10, 11, 7, 11, 5, 4, 10, 11, 10, 0, 7, 11,
            5, 10, 10, 19, 10, 11, 7, 11, 5, 4, 10, 4, 10, 0, 7, 11,
            5, 10, 10, 4, 10, 11, 7, 11, 5, 6, 10, 4, 10, 0, 7, 11
        ];
        let cycle_counts_ed = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9,
            12, 12, 15, 20, 8, 14, 8, 9, 12, 12, 15, 20, 8, 14, 8, 9,
            12, 12, 15, 20, 8, 14, 8, 18, 12, 12, 15, 20, 8, 14, 8, 18,
            12, 12, 15, 20, 8, 14, 8, 0, 12, 12, 15, 20, 8, 14, 8, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            16, 16, 16, 16, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0,
            16, 16, 16, 16, 0, 0, 0, 0, 16, 16, 16, 16, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ];
        let cycle_counts_cb = [
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
            8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
            8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
            8, 8, 8, 8, 8, 8, 12, 8, 8, 8, 8, 8, 8, 8, 12, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8,
            8, 8, 8, 8, 8, 8, 15, 8, 8, 8, 8, 8, 8, 8, 15, 8
        ];
        let cycle_counts_dd = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0,
            0, 14, 20, 10, 8, 8, 11, 0, 0, 15, 20, 10, 8, 8, 11, 0,
            0, 0, 0, 0, 23, 23, 19, 0, 0, 15, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
            0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
            8, 8, 8, 8, 8, 8, 19, 8, 8, 8, 8, 8, 8, 8, 19, 8,
            19, 19, 19, 19, 19, 19, 0, 19, 0, 0, 0, 0, 8, 8, 19, 0,
            0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
            0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
            0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
            0, 0, 0, 0, 8, 8, 19, 0, 0, 0, 0, 0, 8, 8, 19, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 14, 0, 23, 0, 15, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 0, 0, 0, 0, 0, 0
        ];
        return {
            getState,
            setState,
            reset,
            run_instruction,
            interrupt
        };
    }
    class ExidyZ80 {
        constructor(memory, input, output) {
            this.cpu = Z80({
                mem_read: (address) => { return memory.readByte(address); },
                mem_write: (address, data) => { memory.writeByte(address, data); },
                io_read: (address) => { return input.readByte(address); },
                io_write: (address, data) => { output.writeByte(address, data); }
            });
        }
        reset(address) {
            this.cpu.reset(address);
            if (address) {
                const state = this.cpu.getState();
                state.pc = address;
                this.cpu.setState(state);
            }
        }
        executeInstruction() {
            return this.cpu.run_instruction();
        }
        interrupt(non_maskable, value) {
            this.cpu.interrupt(non_maskable, value);
        }
        decodeFlags(flags) {
            return {
                S: (flags & 0x80) >>> 7,
                Z: (flags & 0x40) >>> 6,
                Y: (flags & 0x20) >>> 5,
                H: (flags & 0x10) >>> 4,
                X: (flags & 0x08) >>> 3,
                P: (flags & 0x04) >>> 2,
                N: (flags & 0x02) >>> 1,
                C: (flags & 0x01)
            };
        }
        load(data) {
            this.cpu.setState({
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
                iy: ExidyBytes_2.default.get2lm(data, 15),
                ix: ExidyBytes_2.default.get2lm(data, 17),
                iff2: (data[19] & 0x04) !== 0 ? 1 : 0,
                iff1: (data[19] & 0x02) !== 0 ? 1 : 0,
                r: data[20],
                f: data[21],
                a: data[22],
                sp: ExidyBytes_2.default.get2lm(data, 23),
                imode: data[25],
                pc: ExidyBytes_2.default.get2lm(data, 26),
                flags: this.decodeFlags(data[20]),
                flags_prime: this.decodeFlags(0x00),
                halted: false,
                do_delayed_di: false,
                do_delayed_ei: false,
                cycle_counter: 0
            });
        }
        static getSnp2Size() {
            return 34;
        }
        loadSnp2(data) {
            this.cpu.setState({
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
                iy: ExidyBytes_2.default.get2lm(data, 15),
                ix: ExidyBytes_2.default.get2lm(data, 17),
                iff2: (data[19] & 0x04) !== 0 ? 1 : 0,
                iff1: (data[19] & 0x02) !== 0 ? 1 : 0,
                r: data[20],
                f: data[21],
                a: data[22],
                sp: ExidyBytes_2.default.get2lm(data, 23),
                imode: data[25],
                pc: ExidyBytes_2.default.get2lm(data, 26),
                flags: this.decodeFlags(data[28]),
                flags_prime: this.decodeFlags(data[29]),
                halted: (data[19] & 0x01) !== 0,
                do_delayed_di: (data[19] & 0x08) !== 0,
                do_delayed_ei: (data[19] & 0x10) !== 0,
                cycle_counter: ExidyBytes_2.default.get4lm(data, 30)
            });
        }
    }
    exports.ExidyZ80 = ExidyZ80;
});
define("ExidyTapeUnitMotorControl", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class TapeUnitMotorControl {
        constructor(motorMask) {
            this._motorOn = false;
            this._baud = 300;
            this.listener = null;
            this._motorMask = motorMask;
        }
        writeByte(data) {
            let motorOn = (this._motorMask & data) !== 0;
            if (motorOn && !this._motorOn) {
                if (this.listener)
                    this.listener(true);
                this._baud = (data & 0x40) === 0 ? 300 : 1200;
            }
            else if (!motorOn && this._motorOn) {
                if (this.listener)
                    this.listener(false);
            }
            this._motorOn = motorOn;
        }
        get motorOn() {
            return this._motorOn;
        }
        get baud() {
            return this._baud;
        }
    }
    exports.default = TapeUnitMotorControl;
});
define("ExidyTapeUnit", ["require", "exports", "ExidyMonostable"], function (require, exports, ExidyMonostable_2) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class TapeUnit {
        constructor(motorControl) {
            this.recordListener = null;
            this._motorControl = motorControl;
            this._recordMonostable = new ExidyMonostable_2.default(2000, recording => {
                if (this.recordListener) {
                    this.recordListener(recording);
                }
            });
        }
        get readyForRead() {
            return this.tape && this._motorControl.motorOn;
        }
        get readyForWrite() {
            return this.tape && this._motorControl.motorOn;
        }
        set motorListener(listener) {
            this._motorControl.listener = listener;
        }
        get motorListener() {
            return this._motorControl.listener;
        }
        writeByte(data) {
            this._recordMonostable.activate();
            if (this.readyForWrite) {
                this.tape.writeByte(this._motorControl.baud, data);
            }
        }
        readByte() {
            return this.readyForRead ? this.tape.readByte(this._motorControl.baud) : 0;
        }
    }
    exports.default = TapeUnit;
});
define("ExidyTapeSystem", ["require", "exports", "ExidyTapeUnit", "ExidyTapeUnitMotorControl"], function (require, exports, ExidyTapeUnit_1, ExidyTapeUnitMotorControl_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class TapeSystemStatus {
        constructor(tapeUnits) {
            this._tapeUnits = tapeUnits;
        }
        readByte(address) {
            let status = 0xfc;
            for (let i = 0; i < this._tapeUnits.length; ++i) {
                let tapeUnit = this._tapeUnits[i];
                if (tapeUnit.readyForRead)
                    status |= 0x01;
                if (tapeUnit.readyForWrite)
                    status |= 0x02;
            }
            return status;
        }
    }
    class TapeSystemData {
        constructor(tapeUnits) {
            this._tapeUnits = tapeUnits;
        }
        writeByte(address, data) {
            for (let i = 0; i < this._tapeUnits.length; ++i) {
                let tapeUnit = this._tapeUnits[i];
                tapeUnit.writeByte(data);
            }
        }
        readByte(address) {
            for (let i = 0; i < this._tapeUnits.length; ++i) {
                let tapeUnit = this._tapeUnits[i];
                if (tapeUnit.readyForRead) {
                    return tapeUnit.readByte();
                }
            }
            return 0;
        }
    }
    class TapeSystemControl {
        constructor(tapeControls) {
            this._tapeControls = tapeControls;
        }
        writeByte(address, data) {
            for (let i = 0; i < this._tapeControls.length; ++i) {
                let tapeControl = this._tapeControls[i];
                tapeControl.writeByte(data);
            }
        }
    }
    class TapeSystem {
        constructor() {
            this._tapeControls = [
                new ExidyTapeUnitMotorControl_1.default(0x10),
                new ExidyTapeUnitMotorControl_1.default(0x20)
            ];
            this._tapeUnits = this._tapeControls.map((tapeControl) => {
                return new ExidyTapeUnit_1.default(tapeControl);
            });
            this._tapeSystemStatus = new TapeSystemStatus(this._tapeUnits);
            this._tapeSystemControl = new TapeSystemControl(this._tapeControls);
            this._tapeSystemData = new TapeSystemData(this._tapeUnits);
        }
        get status() {
            return this._tapeSystemStatus;
        }
        get dataOutput() {
            return this._tapeSystemData;
        }
        get dataInput() {
            return this._tapeSystemData;
        }
        get control() {
            return this._tapeSystemControl;
        }
        get units() {
            return this._tapeUnits;
        }
        getUnit(unit) {
            return this._tapeUnits[unit];
        }
    }
    exports.default = TapeSystem;
});
define("ExidySorcerer", ["require", "exports", "ExidyZ80", "DropZone", "ExidyMemorySystem", "ExidyIo", "ExidyKeyboard", "ExidyArrayDisk", "ExidyDiskSystem", "ExidyTapeSystem", "ExidyArrayTape", "ExidyCentronicsSystem"], function (require, exports, ExidyZ80_1, DropZone_1, ExidyMemorySystem_1, ExidyIo_1, ExidyKeyboard_1, ExidyArrayDisk_1, ExidyDiskSystem_1, ExidyTapeSystem_1, ExidyArrayTape_1, ExidyCentronicsSystem_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    const CYCLES_PER_DISK_TICK = 100000;
    class ExidySorcerer {
        constructor(filesystem) {
            this.typeSystem = new ExidyTapeSystem_1.default();
            this.centronicsSystem = new ExidyCentronicsSystem_1.default();
            this._keyboard = new ExidyKeyboard_1.default();
            this._govern = true;
            this._running = false;
            this.filesystem = filesystem;
            this.memorySystem = new ExidyMemorySystem_1.default();
            this.io = new ExidyIo_1.IoSystem();
            this.io.output.addHandler(0xFE, this._keyboard);
            this.io.input.setHandler(0xFE, this._keyboard);
            this.io.output.addHandler(0xFE, this.typeSystem.control);
            this.io.output.addHandler(0xFC, this.typeSystem.dataOutput);
            this.io.input.setHandler(0xFC, this.typeSystem.dataInput);
            this.io.input.setHandler(0xFD, this.typeSystem.status);
            this.io.input.setHandler(0xFF, this.centronicsSystem);
            this.io.output.addHandler(0xFF, this.centronicsSystem);
            this.cpu = new ExidyZ80_1.ExidyZ80(this.memorySystem.memory, this.io.input, this.io.output);
            this.ready = Promise.all([
                this.readMonitorRom().then(data => {
                    this.memorySystem.loadMonitorRom(data);
                }),
                this.readRom('exchr-1.dat').then(data => {
                    this.memorySystem.loadAsciiCharacterRom(data);
                }),
                this.readRom('diskboot.dat').then(data => {
                    this.memorySystem.loadDiskSystemRom(data);
                })
            ]).then(() => {
                this.diskSystem = new ExidyDiskSystem_1.default(this.memorySystem);
            }).then(() => {
                this.memorySystem.updateCharacters();
                this.memorySystem.updateScreen();
                this.reset();
            });
            new DropZone_1.default(this.memorySystem.screenCanvas, (buffer) => {
                this.loadSnpFromArray(new Uint8Array(buffer));
            });
        }
        readRom(name) {
            return this.filesystem.read('roms/' + name);
        }
        readMonitorRom() {
            return Promise.all([this.readRom('exmo1-1.dat'), this.readRom('exmo1-2.dat')])
                .then(p => {
                const p1 = p[0];
                const p2 = p[1];
                const b = new Uint8Array(p1.length + p2.length);
                b.set(p1, 0);
                b.set(p2, p1.length);
                return b;
            });
        }
        get keyboard() {
            return this._keyboard;
        }
        get screenCanvas() {
            return this.memorySystem.screenCanvas;
        }
        ejectRom() {
            this.memorySystem.ejectRomPack8K();
        }
        loadRomFromArray(data) {
            this.memorySystem.loadRomPack8K(data);
        }
        loadSnpFromArray(data) {
            this.memorySystem.load(data, 0x0000, 28);
            this.memorySystem.updateCharacters();
            this.memorySystem.updateScreen();
            this.cpu.load(data);
        }
        obtainDiskSystem() {
            return this.ready.then(() => {
                return this.diskSystem;
            });
        }
        load(snap) {
            this.ready = this.ready.then(() => {
                return this.filesystem.read('snaps/' + snap).then((data) => {
                    this.loadSnpFromArray(data);
                });
            });
        }
        loadRomPack(rom) {
            this.ready = this.ready.then(() => {
                return this.filesystem.read('rom-packs/' + rom).then((data) => {
                    this.loadRomFromArray(data);
                });
            });
        }
        loadDisk(unit, file) {
            this.ready = this.ready.then(() => {
                return this.filesystem.read('disks/' + file).then((data) => {
                    let disk = new ExidyArrayDisk_1.default(data);
                    this.diskSystem.insertDisk(disk, unit);
                });
            });
        }
        obtainTapeSystem() {
            return this.ready.then(() => {
                return this.typeSystem;
            });
        }
        loadTape(unit, file) {
            this.ready = this.ready.then(() => {
                return this.filesystem.read('tapes/' + file).then((data) => {
                    this.typeSystem.units[unit].tape = new ExidyArrayTape_1.default(data);
                });
            });
        }
        set centronics(device) {
            this.centronicsSystem.device = device;
        }
        set govern(govern) {
            console.log('govern: ' + govern);
            this._govern = govern;
        }
        getMem(start, length) {
            return this.memorySystem.getMem(start, length);
        }
        getMemRegions() {
            return this.memorySystem.getRegions();
        }
        reset() {
            this.cycles = 0;
            this.cpu.reset(0xE000);
        }
        step() {
            let c = 0;
            for (let i = 0; i < 3000; ++i) {
                let q = this.cpu.executeInstruction();
                this.cycles += q;
                c += q;
                if (this.cycles > CYCLES_PER_DISK_TICK) {
                    this.cycles -= CYCLES_PER_DISK_TICK;
                    this.diskSystem.tick();
                }
            }
            return c;
        }
        stop() {
            this._running = false;
        }
        run() {
            if (this._running)
                return;
            this._running = true;
            let t = 0;
            let g = 100;
            let c = 0;
            let d = 10;
            let interval = setInterval(() => {
                c += this.step();
            }, d);
            this.ready.then(() => {
                setInterval(() => {
                    if (!this._running) {
                        clearInterval(interval);
                    }
                    else if (this._govern) {
                        t += g * 2000 - c;
                        c = 0;
                        if (t > 100000 && d > 0) {
                            d -= 1;
                            t = 0;
                            clearInterval(interval);
                            interval = setInterval(() => {
                                c += this.step();
                            }, d);
                        }
                        else if (t < -100000) {
                            d += 1;
                            t = 0;
                            clearInterval(interval);
                            interval = setInterval(() => {
                                c += this.step();
                            }, d);
                        }
                    }
                    else {
                        t = 0;
                        c = 0;
                        if (d > 0) {
                            d = 0;
                            clearInterval(interval);
                            interval = setInterval(() => {
                                c += this.step();
                            }, d);
                        }
                    }
                }, g);
            });
        }
    }
    exports.default = ExidySorcerer;
});
define("index", ["require", "exports", "BinaryAjax", "ExidyArrayDisk", "ExidyArrayTape", "ExidyBrowserKeyboard", "ExidyCentronicsSystem", "ExidyCharacters", "ExidyDiskDrive", "ExidyDiskSystem", "ExidyDiskConsts", "ExidyElementPrinter", "ExidyFileBinaryAjax", "ExidyKeyboard", "ExidyMemoryNone", "ExidyMemoryRam", "ExidyMemoryRom", "ExidyMemorySystem", "ExidyScreen", "ExidySorcerer", "ExidyTapeSystem", "ExidyTapeUnitMotorControl", "ExidyTapeUnit"], function (require, exports, BinaryAjax_2, ExidyArrayDisk_2, ExidyArrayTape_2, ExidyBrowserKeyboard_1, ExidyCentronicsSystem_2, ExidyCharacters_2, ExidyDiskDrive_2, ExidyDiskSystem_2, ExidyDiskConsts_3, ExidyElementPrinter_1, ExidyFileBinaryAjax_1, ExidyKeyboard_2, ExidyMemoryNone_1, ExidyMemoryRam_4, ExidyMemoryRom_2, ExidyMemorySystem_2, ExidyScreen_2, ExidySorcerer_1, ExidyTapeSystem_2, ExidyTapeUnitMotorControl_2, ExidyTapeUnit_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BinaryAjax = BinaryAjax_2.default;
    exports.ExidyArrayDisk = ExidyArrayDisk_2.default;
    exports.ExidyArrayTape = ExidyArrayTape_2.default;
    exports.ExidyBrowserKeyboard = ExidyBrowserKeyboard_1.default;
    exports.ExidyCentronicsSystem = ExidyCentronicsSystem_2.default;
    exports.ExidyCharacters = ExidyCharacters_2.default;
    exports.ExidyDiskDrive = ExidyDiskDrive_2.default;
    exports.ExidyDiskSystem = ExidyDiskSystem_2.default;
    __export(ExidyDiskConsts_3);
    exports.ExidyElementPrinter = ExidyElementPrinter_1.default;
    exports.ExidyFileBinaryAjax = ExidyFileBinaryAjax_1.default;
    exports.ExidyKeyboard = ExidyKeyboard_2.default;
    exports.ExidyMemoryNone = ExidyMemoryNone_1.default;
    exports.ExidyMemoryRam = ExidyMemoryRam_4.default;
    exports.ExidyMemoryRom = ExidyMemoryRom_2.default;
    exports.ExidyMemorySystem = ExidyMemorySystem_2.default;
    exports.ExidyScreen = ExidyScreen_2.default;
    exports.ExidySorcerer = ExidySorcerer_1.default;
    exports.ExidyTapeSystem = ExidyTapeSystem_2.default;
    exports.ExidyTapeUnitMotorControl = ExidyTapeUnitMotorControl_2.default;
    exports.ExidyTapeUnit = ExidyTapeUnit_2.default;
});
define("main", ["require", "exports", "ExidySorcerer", "ExidyFileBinaryAjax", "ExidyBrowserKeyboard", "ExidyElementPrinter"], function (require, exports, ExidySorcerer_2, ExidyFileBinaryAjax_2, ExidyBrowserKeyboard_2, ExidyElementPrinter_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const screenContainer = document.getElementById('exidy-screen-container');
    const printerPaper = document.getElementById('exidyPaper');
    const exidyFile = new ExidyFileBinaryAjax_2.default();
    const exidySorcerer = new ExidySorcerer_2.default(exidyFile);
    const keyboard = new ExidyBrowserKeyboard_2.default(exidySorcerer.keyboard);
    screenContainer.appendChild(exidySorcerer.screenCanvas);
    screenContainer.addEventListener('keydown', (key) => {
        keyboard.browserKeyDown(key.keyCode);
        key.stopPropagation();
        key.preventDefault();
    });
    screenContainer.addEventListener('keyup', (key) => {
        keyboard.browserKeyUp(key.keyCode);
        key.stopPropagation();
        key.preventDefault();
    });
    const printer = new ExidyElementPrinter_2.default(printerPaper);
    exidySorcerer.run();
});
