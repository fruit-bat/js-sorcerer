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
        activate() {
        }
        deactivate() {
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
                new ExidyKey_1.default('unknown3', 1, 4),
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
                new ExidyKey_1.default('Graphics', 0, 1),
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
                console.log('pressing ' + key.row + ' ' + key.col);
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
            console.log(key + ' ' + JSON.stringify(keyId));
            if (keyId) {
                this._keyboard.pressKey(keyId);
            }
        }
    }
    exports.default = BrowserKeyboard;
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
            if (address >= 0xFC00 && (data !== this.readByte(address))) {
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
define("ExidyDiskDrive", ["require", "exports", "ExidyDiskConsts"], function (require, exports, ExidyDiskConsts_2) {
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
            this._unitNumber = unitNumber;
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
            if (this._activeCount === 0 && this._disk !== null) {
                this._disk.activate();
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
                    if (this._disk !== null) {
                        this._disk.deactivate();
                    }
                }
            }
        }
    }
    exports.default = ExidyDiskDrive;
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
define("ExidyMemorySystem", ["require", "exports", "ExidyMemoryNone", "ExidyMemory", "ExidyMemoryRam", "ExidyMemoryRom", "ExidyCharacters", "ExidyScreen"], function (require, exports, ExidyMemoryNone_1, ExidyMemory_3, ExidyMemoryRam_3, ExidyMemoryRom_1, ExidyCharacters_1, ExidyScreen_1) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class Multiplexor {
        constructor() {
            this._ignoreBits = 7;
            this.handlers = new Array(ExidyMemory_3.MEMORY_SIZE_IN_BYTES >> this._ignoreBits);
            this.handlers.fill(new ExidyMemoryNone_1.default());
        }
        readByte(address) {
            return this.handlers[address >> this._ignoreBits].readByte(address);
        }
        writeByte(address, data) {
            this.handlers[address >> this._ignoreBits].writeByte(address, data);
        }
        checkGranularity(address) {
            return ((address >> this._ignoreBits) << this._ignoreBits) === address;
        }
        setHandler(address, length, handler) {
            if (!this.checkGranularity(address) || !this.checkGranularity(length)) {
                console.log('WARNING: handler granularity missmatch');
                console.log(address.toString(16) + " " + length.toString(16));
            }
            this.handlers.fill(handler, address >> this._ignoreBits, (address + length) >> this._ignoreBits);
        }
    }
    class MemorySystem {
        constructor() {
            this._memory = new Uint8Array(ExidyMemory_3.MEMORY_SIZE_IN_BYTES);
            this.ram = new ExidyMemoryRam_3.default(this._memory);
            this.rom = new ExidyMemoryRom_1.default(this._memory);
            this.multplexor = new Multiplexor();
            this.multplexor.setHandler(0, ExidyMemory_3.MEMORY_SIZE_IN_BYTES, this.ram);
            this.multplexor.setHandler(0xF800, 0xFE00 - 0xF800, this.rom);
            const charsCanvas = document.createElement('canvas');
            charsCanvas.width = 2048;
            charsCanvas.height = 8;
            this.exidyScreen = new ExidyScreen_1.default(this._memory, charsCanvas);
            this.exidyCharacters = new ExidyCharacters_1.default(this._memory, charsCanvas, (char, row) => {
                this.exidyScreen.charUpdated(char, row);
            });
            this.multplexor.setHandler(ExidyMemory_3.SCREEN_START, ExidyMemory_3.SCREEN_SIZE_BYTES, this.exidyScreen);
            this.multplexor.setHandler(ExidyMemory_3.CHARS_START, ExidyMemory_3.CHARS_SIZE_BYTES, this.exidyCharacters);
        }
        get screenCanvas() {
            return this.exidyScreen.canvas;
        }
        load(data, address, start = 0) {
            this._memory.set(data.subarray(start), address);
        }
        loadRom(data, address) {
            this._memory.set(data, address);
            this.multplexor.setHandler(address, data.length, this.rom);
        }
        ejectRom(address, length) {
            this.multplexor.setHandler(address, length, this.ram);
            this._memory.fill(255, address, address + length);
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
        setHandler(address, length, handler) {
            this.multplexor.setHandler(address, length, handler);
        }
        getMem(start, length) {
            return this._memory.subarray(start, start + length);
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
            memorySystem.setHandler(MEM_DISK_REG_START, MEM_DISK_REG_LEN, this);
        }
        getExidyDiskDrive(drive) {
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
define("ExidyZ80", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    function Z80(core) {
        if (!core || (typeof core.mem_read !== 'function') || (typeof core.mem_write !== 'function') ||
            (typeof core.io_read !== 'function') || (typeof core.io_write !== 'function'))
            throw ('Z80: Core object is missing required functions.');
        if (this === window)
            throw ('Z80: This function is a constructor; call it using operator new.');
        this.core = core;
        this.a = 0x00;
        this.b = 0x00;
        this.c = 0x00;
        this.d = 0x00;
        this.e = 0x00;
        this.h = 0x00;
        this.l = 0x00;
        this.a_prime = 0x00;
        this.b_prime = 0x00;
        this.c_prime = 0x00;
        this.d_prime = 0x00;
        this.e_prime = 0x00;
        this.h_prime = 0x00;
        this.l_prime = 0x00;
        this.ix = 0x0000;
        this.iy = 0x0000;
        this.i = 0x00;
        this.r = 0x00;
        this.sp = 0xdff0;
        this.pc = 0x0000;
        this.flags = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
        this.flags_prime = { S: 0, Z: 0, Y: 0, H: 0, X: 0, P: 0, N: 0, C: 0 };
        this.imode = 0;
        this.iff1 = 0;
        this.iff2 = 0;
        this.halted = false;
        this.do_delayed_di = false;
        this.do_delayed_ei = false;
        this.cycle_counter = 0;
        this.api = {
            reset: this.reset.bind(this),
            run_instruction: this.run_instruction.bind(this),
            interrupt: this.interrupt.bind(this),
            load: this.load.bind(this)
        };
    }
    Z80.prototype.load = function (state) {
        this.reset();
        this.i = state.i;
        this.a_prime = state.a_prime;
        this.b_prime = state.b_prime;
        this.c_prime = state.c_prime;
        this.d_prime = state.d_prime;
        this.e_prime = state.e_prime;
        this.h_prime = state.h_prime;
        this.l_prime = state.l_prime;
        this.set_flags_prime(state.f_prime);
        this.a = state.a;
        this.b = state.b;
        this.c = state.c;
        this.d = state.d;
        this.e = state.e;
        this.h = state.h;
        this.l = state.l;
        this.ix = state.ix;
        this.iy = state.iy;
        this.iff1 = state.iff1;
        this.iff2 = state.iff2;
        this.set_flags_register(state.f);
        this.r = state.r;
        this.imode = state.imode;
        this.pc = state.pc;
        this.sp = state.sp;
    };
    Z80.prototype.reset = function (pc) {
        this.sp = 0xdff0;
        this.pc = typeof pc === 'undefined' ? 0x000 : pc;
        this.a = 0x00;
        this.r = 0x00;
        this.set_flags_register(0);
        this.imode = 0;
        this.iff1 = 0;
        this.iff2 = 0;
        this.halted = false;
        this.do_delayed_di = false;
        this.do_delayed_ei = false;
        this.cycle_counter = 0;
    };
    Z80.prototype.run_instruction = function () {
        if (!this.halted) {
            let doing_delayed_di = false, doing_delayed_ei = false;
            if (this.do_delayed_di) {
                this.do_delayed_di = false;
                doing_delayed_di = true;
            }
            else if (this.do_delayed_ei) {
                this.do_delayed_ei = false;
                doing_delayed_ei = true;
            }
            this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
            let opcode = this.core.mem_read(this.pc);
            this.decode_instruction(opcode);
            this.pc = (this.pc + 1) & 0xffff;
            if (doing_delayed_di) {
                this.iff1 = 0;
                this.iff2 = 0;
            }
            else if (doing_delayed_ei) {
                this.iff1 = 1;
                this.iff2 = 1;
            }
            let retval = this.cycle_counter;
            this.cycle_counter = 0;
            return retval;
        }
        else {
            return 1;
        }
    };
    Z80.prototype.interrupt = function (non_maskable, data) {
        if (non_maskable) {
            this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
            this.halted = false;
            this.iff2 = this.iff1;
            this.iff1 = 0;
            this.push_word(this.pc);
            this.pc = 0x66;
            this.cycle_counter += 11;
        }
        else if (this.iff1) {
            this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
            this.halted = false;
            this.iff1 = 0;
            this.iff2 = 0;
            if (this.imode === 0) {
                this.decode_instruction(data);
                this.cycle_counter += 2;
            }
            else if (this.imode === 1) {
                this.push_word(this.pc);
                this.pc = 0x38;
                this.cycle_counter += 13;
            }
            else if (this.imode === 2) {
                this.push_word(this.pc);
                let vector_address = ((this.i << 8) | data);
                this.pc = this.core.read_mem_byte(vector_address) |
                    (this.core.read_mem_byte((vector_address + 1) & 0xffff) << 8);
                this.cycle_counter += 19;
            }
        }
    };
    let get_operand = function (opcode) {
        let opcodeLowerBits = opcode & 0x07;
        return (opcodeLowerBits === 0) ? this.b :
            (opcodeLowerBits === 1) ? this.c :
                (opcodeLowerBits === 2) ? this.d :
                    (opcodeLowerBits === 3) ? this.e :
                        (opcodeLowerBits === 4) ? this.h :
                            (opcodeLowerBits === 5) ? this.l :
                                (opcodeLowerBits === 6) ? this.core.mem_read(this.l | (this.h << 8)) : this.a;
    };
    Z80.prototype.decode_instruction = function (opcode) {
        if (opcode === 0x76) {
            this.halted = true;
            this.iff1 = 1;
            this.iff2 = 1;
        }
        else if ((opcode >= 0x40) && (opcode < 0x80)) {
            let operand = get_operand.call(this, opcode);
            let operandShifted = (opcode & 0x38) >>> 3;
            if (operandShifted === 0)
                this.b = operand;
            else if (operandShifted === 1)
                this.c = operand;
            else if (operandShifted === 2)
                this.d = operand;
            else if (operandShifted === 3)
                this.e = operand;
            else if (operandShifted === 4)
                this.h = operand;
            else if (operandShifted === 5)
                this.l = operand;
            else if (operandShifted === 6)
                this.core.mem_write(this.l | (this.h << 8), operand);
            else if (operandShifted === 7)
                this.a = operand;
        }
        else if ((opcode >= 0x80) && (opcode < 0xc0)) {
            let operand = get_operand.call(this, opcode);
            const op_array = [this.do_add, this.do_adc, this.do_sub, this.do_sbc,
                this.do_and, this.do_xor, this.do_or, this.do_cp];
            op_array[(opcode & 0x38) >>> 3].call(this, operand);
        }
        else {
            let func = this.instructions[opcode].bind(this);
            func();
        }
        this.cycle_counter += this.cycle_counts[opcode];
    };
    Z80.prototype.get_signed_offset_byte = function (value) {
        value &= 0xff;
        if (value & 0x80) {
            value = -((0xff & ~value) + 1);
        }
        return value;
    };
    Z80.prototype.get_flags_register = function () {
        return (this.flags.S << 7) |
            (this.flags.Z << 6) |
            (this.flags.Y << 5) |
            (this.flags.H << 4) |
            (this.flags.X << 3) |
            (this.flags.P << 2) |
            (this.flags.N << 1) |
            (this.flags.C);
    };
    Z80.prototype.get_flags_prime = function () {
        return (this.flags_prime.S << 7) |
            (this.flags_prime.Z << 6) |
            (this.flags_prime.Y << 5) |
            (this.flags_prime.H << 4) |
            (this.flags_prime.X << 3) |
            (this.flags_prime.P << 2) |
            (this.flags_prime.N << 1) |
            (this.flags_prime.C);
    };
    Z80.prototype.set_flags_register = function (operand) {
        this.flags.S = (operand & 0x80) >>> 7;
        this.flags.Z = (operand & 0x40) >>> 6;
        this.flags.Y = (operand & 0x20) >>> 5;
        this.flags.H = (operand & 0x10) >>> 4;
        this.flags.X = (operand & 0x08) >>> 3;
        this.flags.P = (operand & 0x04) >>> 2;
        this.flags.N = (operand & 0x02) >>> 1;
        this.flags.C = (operand & 0x01);
    };
    Z80.prototype.set_flags_prime = function (operand) {
        this.flags_prime.S = (operand & 0x80) >>> 7;
        this.flags_prime.Z = (operand & 0x40) >>> 6;
        this.flags_prime.Y = (operand & 0x20) >>> 5;
        this.flags_prime.H = (operand & 0x10) >>> 4;
        this.flags_prime.X = (operand & 0x08) >>> 3;
        this.flags_prime.P = (operand & 0x04) >>> 2;
        this.flags_prime.N = (operand & 0x02) >>> 1;
        this.flags_prime.C = (operand & 0x01);
    };
    Z80.prototype.update_xy_flags = function (result) {
        this.flags.Y = (result & 0x20) >>> 5;
        this.flags.X = (result & 0x08) >>> 3;
    };
    Z80.prototype.get_parity = function (value) {
        let parity_bits = [
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
    Z80.prototype.push_word = function (operand) {
        this.sp = (this.sp - 1) & 0xffff;
        this.core.mem_write(this.sp, (operand & 0xff00) >>> 8);
        this.sp = (this.sp - 1) & 0xffff;
        this.core.mem_write(this.sp, operand & 0x00ff);
    };
    Z80.prototype.pop_word = function () {
        let retval = this.core.mem_read(this.sp) & 0xff;
        this.sp = (this.sp + 1) & 0xffff;
        retval |= this.core.mem_read(this.sp) << 8;
        this.sp = (this.sp + 1) & 0xffff;
        return retval;
    };
    Z80.prototype.do_conditional_absolute_jump = function (condition) {
        if (condition) {
            this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
                (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
            this.pc = (this.pc - 1) & 0xffff;
        }
        else {
            this.pc = (this.pc + 2) & 0xffff;
        }
    };
    Z80.prototype.do_conditional_relative_jump = function (condition) {
        if (condition) {
            this.cycle_counter += 5;
            let offset = this.get_signed_offset_byte(this.core.mem_read((this.pc + 1) & 0xffff));
            this.pc = (this.pc + offset + 1) & 0xffff;
        }
        else {
            this.pc = (this.pc + 1) & 0xffff;
        }
    };
    Z80.prototype.do_conditional_call = function (condition) {
        if (condition) {
            this.cycle_counter += 7;
            this.push_word((this.pc + 3) & 0xffff);
            this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
                (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
            this.pc = (this.pc - 1) & 0xffff;
        }
        else {
            this.pc = (this.pc + 2) & 0xffff;
        }
    };
    Z80.prototype.do_conditional_return = function (condition) {
        if (condition) {
            this.cycle_counter += 6;
            this.pc = (this.pop_word() - 1) & 0xffff;
        }
    };
    Z80.prototype.do_reset = function (address) {
        this.push_word((this.pc + 1) & 0xffff);
        this.pc = (address - 1) & 0xffff;
    };
    Z80.prototype.do_add = function (operand) {
        let result = this.a + operand;
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = !(result & 0xff) ? 1 : 0;
        this.flags.H = (((operand & 0x0f) + (this.a & 0x0f)) & 0x10) ? 1 : 0;
        this.flags.P = ((this.a & 0x80) === (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
        this.flags.N = 0;
        this.flags.C = (result & 0x100) ? 1 : 0;
        this.a = result & 0xff;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_adc = function (operand) {
        let result = this.a + operand + this.flags.C;
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = !(result & 0xff) ? 1 : 0;
        this.flags.H = (((operand & 0x0f) + (this.a & 0x0f) + this.flags.C) & 0x10) ? 1 : 0;
        this.flags.P = ((this.a & 0x80) === (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
        this.flags.N = 0;
        this.flags.C = (result & 0x100) ? 1 : 0;
        this.a = result & 0xff;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_sub = function (operand) {
        let result = this.a - operand;
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = !(result & 0xff) ? 1 : 0;
        this.flags.H = (((this.a & 0x0f) - (operand & 0x0f)) & 0x10) ? 1 : 0;
        this.flags.P = ((this.a & 0x80) !== (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
        this.flags.N = 1;
        this.flags.C = (result & 0x100) ? 1 : 0;
        this.a = result & 0xff;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_sbc = function (operand) {
        let result = this.a - operand - this.flags.C;
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = !(result & 0xff) ? 1 : 0;
        this.flags.H = (((this.a & 0x0f) - (operand & 0x0f) - this.flags.C) & 0x10) ? 1 : 0;
        this.flags.P = ((this.a & 0x80) !== (operand & 0x80)) && ((this.a & 0x80) !== (result & 0x80)) ? 1 : 0;
        this.flags.N = 1;
        this.flags.C = (result & 0x100) ? 1 : 0;
        this.a = result & 0xff;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_cp = function (operand) {
        let temp = this.a;
        this.do_sub(operand);
        this.a = temp;
        this.update_xy_flags(operand);
    };
    Z80.prototype.do_and = function (operand) {
        this.a &= operand & 0xff;
        this.flags.S = (this.a & 0x80) ? 1 : 0;
        this.flags.Z = !this.a ? 1 : 0;
        this.flags.H = 1;
        this.flags.P = this.get_parity(this.a);
        this.flags.N = 0;
        this.flags.C = 0;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_or = function (operand) {
        this.a = (operand | this.a) & 0xff;
        this.flags.S = (this.a & 0x80) ? 1 : 0;
        this.flags.Z = !this.a ? 1 : 0;
        this.flags.H = 0;
        this.flags.P = this.get_parity(this.a);
        this.flags.N = 0;
        this.flags.C = 0;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_xor = function (operand) {
        this.a = (operand ^ this.a) & 0xff;
        this.flags.S = (this.a & 0x80) ? 1 : 0;
        this.flags.Z = !this.a ? 1 : 0;
        this.flags.H = 0;
        this.flags.P = this.get_parity(this.a);
        this.flags.N = 0;
        this.flags.C = 0;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_inc = function (operand) {
        let result = operand + 1;
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = !(result & 0xff) ? 1 : 0;
        this.flags.H = ((operand & 0x0f) === 0x0f) ? 1 : 0;
        this.flags.P = (operand === 0x7f) ? 1 : 0;
        this.flags.N = 0;
        result &= 0xff;
        this.update_xy_flags(result);
        return result;
    };
    Z80.prototype.do_dec = function (operand) {
        let result = operand - 1;
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = !(result & 0xff) ? 1 : 0;
        this.flags.H = ((operand & 0x0f) === 0x00) ? 1 : 0;
        this.flags.P = (operand === 0x80) ? 1 : 0;
        this.flags.N = 1;
        result &= 0xff;
        this.update_xy_flags(result);
        return result;
    };
    Z80.prototype.do_hl_add = function (operand) {
        let hl = this.l | (this.h << 8), result = hl + operand;
        this.flags.N = 0;
        this.flags.C = (result & 0x10000) ? 1 : 0;
        this.flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        this.update_xy_flags(this.h);
    };
    Z80.prototype.do_hl_adc = function (operand) {
        operand += this.flags.C;
        let hl = this.l | (this.h << 8), result = hl + operand;
        this.flags.S = (result & 0x8000) ? 1 : 0;
        this.flags.Z = !(result & 0xffff) ? 1 : 0;
        this.flags.H = (((hl & 0x0fff) + (operand & 0x0fff)) & 0x1000) ? 1 : 0;
        this.flags.P = ((hl & 0x8000) === (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
        this.flags.N = 0;
        this.flags.C = (result & 0x10000) ? 1 : 0;
        this.l = result & 0xff;
        this.h = (result >>> 8) & 0xff;
        this.update_xy_flags(this.h);
    };
    Z80.prototype.do_hl_sbc = function (operand) {
        operand += this.flags.C;
        let hl = this.l | (this.h << 8), result = hl - operand;
        this.flags.S = (result & 0x8000) ? 1 : 0;
        this.flags.Z = !(result & 0xffff) ? 1 : 0;
        this.flags.H = (((hl & 0x0fff) - (operand & 0x0fff)) & 0x1000) ? 1 : 0;
        this.flags.P = ((hl & 0x8000) !== (operand & 0x8000)) && ((result & 0x8000) !== (hl & 0x8000)) ? 1 : 0;
        this.flags.N = 1;
        this.flags.C = (result & 0x10000) ? 1 : 0;
        this.l = result & 0xff;
        this.h = (result >>> 8) & 0xff;
        this.update_xy_flags(this.h);
    };
    Z80.prototype.do_in = function (port) {
        let result = this.core.io_read(port);
        this.flags.S = (result & 0x80) ? 1 : 0;
        this.flags.Z = result ? 0 : 1;
        this.flags.H = 0;
        this.flags.P = this.get_parity(result) ? 1 : 0;
        this.flags.N = 0;
        this.update_xy_flags(result);
        return result;
    };
    Z80.prototype.do_neg = function () {
        if (this.a !== 0x80) {
            this.a = this.get_signed_offset_byte(this.a);
            this.a = (-this.a) & 0xff;
        }
        this.flags.S = (this.a & 0x80) ? 1 : 0;
        this.flags.Z = !this.a ? 1 : 0;
        this.flags.H = (((-this.a) & 0x0f) > 0) ? 1 : 0;
        this.flags.P = (this.a === 0x80) ? 1 : 0;
        this.flags.N = 1;
        this.flags.C = this.a ? 1 : 0;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.do_ldi = function () {
        let read_value = this.core.mem_read(this.l | (this.h << 8));
        this.core.mem_write(this.e | (this.d << 8), read_value);
        let result = (this.e | (this.d << 8)) + 1;
        this.e = result & 0xff;
        this.d = (result & 0xff00) >>> 8;
        result = (this.l | (this.h << 8)) + 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        result = (this.c | (this.b << 8)) - 1;
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
        this.flags.H = 0;
        this.flags.P = (this.c || this.b) ? 1 : 0;
        this.flags.N = 0;
        this.flags.Y = ((this.a + read_value) & 0x02) >>> 1;
        this.flags.X = ((this.a + read_value) & 0x08) >>> 3;
    };
    Z80.prototype.do_cpi = function () {
        let temp_carry = this.flags.C;
        let read_value = this.core.mem_read(this.l | (this.h << 8));
        this.do_cp(read_value);
        this.flags.C = temp_carry;
        this.flags.Y = ((this.a - read_value - this.flags.H) & 0x02) >>> 1;
        this.flags.X = ((this.a - read_value - this.flags.H) & 0x08) >>> 3;
        let result = (this.l | (this.h << 8)) + 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        result = (this.c | (this.b << 8)) - 1;
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
        this.flags.P = result ? 1 : 0;
    };
    Z80.prototype.do_ini = function () {
        this.b = this.do_dec(this.b);
        this.core.mem_write(this.l | (this.h << 8), this.core.io_read((this.b << 8) | this.c));
        let result = (this.l | (this.h << 8)) + 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        this.flags.N = 1;
    };
    Z80.prototype.do_outi = function () {
        this.core.io_write((this.b << 8) | this.c, this.core.mem_read(this.l | (this.h << 8)));
        let result = (this.l | (this.h << 8)) + 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        this.b = this.do_dec(this.b);
        this.flags.N = 1;
    };
    Z80.prototype.do_ldd = function () {
        this.flags.N = 0;
        this.flags.H = 0;
        let read_value = this.core.mem_read(this.l | (this.h << 8));
        this.core.mem_write(this.e | (this.d << 8), read_value);
        let result = (this.e | (this.d << 8)) - 1;
        this.e = result & 0xff;
        this.d = (result & 0xff00) >>> 8;
        result = (this.l | (this.h << 8)) - 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        result = (this.c | (this.b << 8)) - 1;
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
        this.flags.P = (this.c || this.b) ? 1 : 0;
        this.flags.Y = ((this.a + read_value) & 0x02) >>> 1;
        this.flags.X = ((this.a + read_value) & 0x08) >>> 3;
    };
    Z80.prototype.do_cpd = function () {
        let temp_carry = this.flags.C;
        let read_value = this.core.mem_read(this.l | (this.h << 8));
        this.do_cp(read_value);
        this.flags.C = temp_carry;
        this.flags.Y = ((this.a - read_value - this.flags.H) & 0x02) >>> 1;
        this.flags.X = ((this.a - read_value - this.flags.H) & 0x08) >>> 3;
        let result = (this.l | (this.h << 8)) - 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        result = (this.c | (this.b << 8)) - 1;
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
        this.flags.P = result ? 1 : 0;
    };
    Z80.prototype.do_ind = function () {
        this.b = this.do_dec(this.b);
        this.core.mem_write(this.l | (this.h << 8), this.core.io_read((this.b << 8) | this.c));
        let result = (this.l | (this.h << 8)) - 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        this.flags.N = 1;
    };
    Z80.prototype.do_outd = function () {
        this.core.io_write((this.b << 8) | this.c, this.core.mem_read(this.l | (this.h << 8)));
        let result = (this.l | (this.h << 8)) - 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
        this.b = this.do_dec(this.b);
        this.flags.N = 1;
    };
    Z80.prototype.do_rlc = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = (operand & 0x80) >>> 7;
        operand = ((operand << 1) | this.flags.C) & 0xff;
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_rrc = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = operand & 1;
        operand = ((operand >>> 1) & 0x7f) | (this.flags.C << 7);
        this.flags.Z = !(operand & 0xff) ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand & 0xff;
    };
    Z80.prototype.do_rl = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        let temp = this.flags.C;
        this.flags.C = (operand & 0x80) >>> 7;
        operand = ((operand << 1) | temp) & 0xff;
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_rr = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        let temp = this.flags.C;
        this.flags.C = operand & 1;
        operand = ((operand >>> 1) & 0x7f) | (temp << 7);
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_sla = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = (operand & 0x80) >>> 7;
        operand = (operand << 1) & 0xff;
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_sra = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = operand & 1;
        operand = ((operand >>> 1) & 0x7f) | (operand & 0x80);
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_sll = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = (operand & 0x80) >>> 7;
        operand = ((operand << 1) & 0xff) | 1;
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = (operand & 0x80) ? 1 : 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_srl = function (operand) {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = operand & 1;
        operand = (operand >>> 1) & 0x7f;
        this.flags.Z = !operand ? 1 : 0;
        this.flags.P = this.get_parity(operand);
        this.flags.S = 0;
        this.update_xy_flags(operand);
        return operand;
    };
    Z80.prototype.do_ix_add = function (operand) {
        this.flags.N = 0;
        let result = this.ix + operand;
        this.flags.C = (result & 0x10000) ? 1 : 0;
        this.flags.H = (((this.ix & 0xfff) + (operand & 0xfff)) & 0x1000) ? 1 : 0;
        this.update_xy_flags((result & 0xff00) >>> 8);
        this.ix = result;
    };
    Z80.prototype.instructions = [];
    Z80.prototype.instructions[0x00] = function () { };
    Z80.prototype.instructions[0x01] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.c = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        this.b = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x02] = function () {
        this.core.mem_write(this.c | (this.b << 8), this.a);
    };
    Z80.prototype.instructions[0x03] = function () {
        let result = (this.c | (this.b << 8));
        result += 1;
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0x04] = function () {
        this.b = this.do_inc(this.b);
    };
    Z80.prototype.instructions[0x05] = function () {
        this.b = this.do_dec(this.b);
    };
    Z80.prototype.instructions[0x06] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.b = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x07] = function () {
        let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
        this.a = this.do_rlc(this.a);
        this.flags.S = temp_s;
        this.flags.Z = temp_z;
        this.flags.P = temp_p;
    };
    Z80.prototype.instructions[0x08] = function () {
        let temp = this.a;
        this.a = this.a_prime;
        this.a_prime = temp;
        temp = this.get_flags_register();
        this.set_flags_register(this.get_flags_prime());
        this.set_flags_prime(temp);
    };
    Z80.prototype.instructions[0x09] = function () {
        this.do_hl_add(this.c | (this.b << 8));
    };
    Z80.prototype.instructions[0x0a] = function () {
        this.a = this.core.mem_read(this.c | (this.b << 8));
    };
    Z80.prototype.instructions[0x0b] = function () {
        let result = (this.c | (this.b << 8));
        result -= 1;
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0x0c] = function () {
        this.c = this.do_inc(this.c);
    };
    Z80.prototype.instructions[0x0d] = function () {
        this.c = this.do_dec(this.c);
    };
    Z80.prototype.instructions[0x0e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.c = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x0f] = function () {
        let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
        this.a = this.do_rrc(this.a);
        this.flags.S = temp_s;
        this.flags.Z = temp_z;
        this.flags.P = temp_p;
    };
    Z80.prototype.instructions[0x10] = function () {
        this.b = (this.b - 1) & 0xff;
        this.do_conditional_relative_jump(this.b !== 0);
    };
    Z80.prototype.instructions[0x11] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.e = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        this.d = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x12] = function () {
        this.core.mem_write(this.e | (this.d << 8), this.a);
    };
    Z80.prototype.instructions[0x13] = function () {
        let result = (this.e | (this.d << 8));
        result += 1;
        this.e = result & 0xff;
        this.d = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0x14] = function () {
        this.d = this.do_inc(this.d);
    };
    Z80.prototype.instructions[0x15] = function () {
        this.d = this.do_dec(this.d);
    };
    Z80.prototype.instructions[0x16] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.d = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x17] = function () {
        let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
        this.a = this.do_rl(this.a);
        this.flags.S = temp_s;
        this.flags.Z = temp_z;
        this.flags.P = temp_p;
    };
    Z80.prototype.instructions[0x18] = function () {
        let offset = this.get_signed_offset_byte(this.core.mem_read((this.pc + 1) & 0xffff));
        this.pc = (this.pc + offset + 1) & 0xffff;
    };
    Z80.prototype.instructions[0x19] = function () {
        this.do_hl_add(this.e | (this.d << 8));
    };
    Z80.prototype.instructions[0x1a] = function () {
        this.a = this.core.mem_read(this.e | (this.d << 8));
    };
    Z80.prototype.instructions[0x1b] = function () {
        let result = (this.e | (this.d << 8));
        result -= 1;
        this.e = result & 0xff;
        this.d = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0x1c] = function () {
        this.e = this.do_inc(this.e);
    };
    Z80.prototype.instructions[0x1d] = function () {
        this.e = this.do_dec(this.e);
    };
    Z80.prototype.instructions[0x1e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.e = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x1f] = function () {
        let temp_s = this.flags.S, temp_z = this.flags.Z, temp_p = this.flags.P;
        this.a = this.do_rr(this.a);
        this.flags.S = temp_s;
        this.flags.Z = temp_z;
        this.flags.P = temp_p;
    };
    Z80.prototype.instructions[0x20] = function () {
        this.do_conditional_relative_jump(!this.flags.Z);
    };
    Z80.prototype.instructions[0x21] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.l = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        this.h = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x22] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.core.mem_write(address, this.l);
        this.core.mem_write((address + 1) & 0xffff, this.h);
    };
    Z80.prototype.instructions[0x23] = function () {
        let result = (this.l | (this.h << 8));
        result += 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0x24] = function () {
        this.h = this.do_inc(this.h);
    };
    Z80.prototype.instructions[0x25] = function () {
        this.h = this.do_dec(this.h);
    };
    Z80.prototype.instructions[0x26] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.h = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x27] = function () {
        let temp = this.a;
        if (!this.flags.N) {
            if (this.flags.H || ((this.a & 0x0f) > 9))
                temp += 0x06;
            if (this.flags.C || (this.a > 0x99))
                temp += 0x60;
        }
        else {
            if (this.flags.H || ((this.a & 0x0f) > 9))
                temp -= 0x06;
            if (this.flags.C || (this.a > 0x99))
                temp -= 0x60;
        }
        this.flags.S = (temp & 0x80) ? 1 : 0;
        this.flags.Z = !(temp & 0xff) ? 1 : 0;
        this.flags.H = ((this.a & 0x10) ^ (temp & 0x10)) ? 1 : 0;
        this.flags.P = this.get_parity(temp & 0xff);
        this.flags.C = (this.flags.C || (this.a > 0x99)) ? 1 : 0;
        this.a = temp & 0xff;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.instructions[0x28] = function () {
        this.do_conditional_relative_jump(!!this.flags.Z);
    };
    Z80.prototype.instructions[0x29] = function () {
        this.do_hl_add(this.l | (this.h << 8));
    };
    Z80.prototype.instructions[0x2a] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.l = this.core.mem_read(address);
        this.h = this.core.mem_read((address + 1) & 0xffff);
    };
    Z80.prototype.instructions[0x2b] = function () {
        let result = (this.l | (this.h << 8));
        result -= 1;
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0x2c] = function () {
        this.l = this.do_inc(this.l);
    };
    Z80.prototype.instructions[0x2d] = function () {
        this.l = this.do_dec(this.l);
    };
    Z80.prototype.instructions[0x2e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.l = this.core.mem_read(this.pc);
    };
    Z80.prototype.instructions[0x2f] = function () {
        this.a = (~this.a) & 0xff;
        this.flags.N = 1;
        this.flags.H = 1;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.instructions[0x30] = function () {
        this.do_conditional_relative_jump(!this.flags.C);
    };
    Z80.prototype.instructions[0x31] = function () {
        this.sp = this.core.mem_read((this.pc + 1) & 0xffff) |
            (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
        this.pc = (this.pc + 2) & 0xffff;
    };
    Z80.prototype.instructions[0x32] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.core.mem_write(address, this.a);
    };
    Z80.prototype.instructions[0x33] = function () {
        this.sp = (this.sp + 1) & 0xffff;
    };
    Z80.prototype.instructions[0x34] = function () {
        let address = this.l | (this.h << 8);
        this.core.mem_write(address, this.do_inc(this.core.mem_read(address)));
    };
    Z80.prototype.instructions[0x35] = function () {
        let address = this.l | (this.h << 8);
        this.core.mem_write(address, this.do_dec(this.core.mem_read(address)));
    };
    Z80.prototype.instructions[0x36] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.core.mem_write(this.l | (this.h << 8), this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0x37] = function () {
        this.flags.N = 0;
        this.flags.H = 0;
        this.flags.C = 1;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.instructions[0x38] = function () {
        this.do_conditional_relative_jump(!!this.flags.C);
    };
    Z80.prototype.instructions[0x39] = function () {
        this.do_hl_add(this.sp);
    };
    Z80.prototype.instructions[0x3a] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.a = this.core.mem_read(address);
    };
    Z80.prototype.instructions[0x3b] = function () {
        this.sp = (this.sp - 1) & 0xffff;
    };
    Z80.prototype.instructions[0x3c] = function () {
        this.a = this.do_inc(this.a);
    };
    Z80.prototype.instructions[0x3d] = function () {
        this.a = this.do_dec(this.a);
    };
    Z80.prototype.instructions[0x3e] = function () {
        this.a = this.core.mem_read((this.pc + 1) & 0xffff);
        this.pc = (this.pc + 1) & 0xffff;
    };
    Z80.prototype.instructions[0x3f] = function () {
        this.flags.N = 0;
        this.flags.H = this.flags.C;
        this.flags.C = this.flags.C ? 0 : 1;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.instructions[0xc0] = function () {
        this.do_conditional_return(!this.flags.Z);
    };
    Z80.prototype.instructions[0xc1] = function () {
        let result = this.pop_word();
        this.c = result & 0xff;
        this.b = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0xc2] = function () {
        this.do_conditional_absolute_jump(!this.flags.Z);
    };
    Z80.prototype.instructions[0xc3] = function () {
        this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
            (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
        this.pc = (this.pc - 1) & 0xffff;
    };
    Z80.prototype.instructions[0xc4] = function () {
        this.do_conditional_call(!this.flags.Z);
    };
    Z80.prototype.instructions[0xc5] = function () {
        this.push_word(this.c | (this.b << 8));
    };
    Z80.prototype.instructions[0xc6] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_add(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xc7] = function () {
        this.do_reset(0x00);
    };
    Z80.prototype.instructions[0xc8] = function () {
        this.do_conditional_return(!!this.flags.Z);
    };
    Z80.prototype.instructions[0xc9] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
    };
    Z80.prototype.instructions[0xca] = function () {
        this.do_conditional_absolute_jump(!!this.flags.Z);
    };
    Z80.prototype.instructions[0xcb] = function () {
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        this.pc = (this.pc + 1) & 0xffff;
        let opcode = this.core.mem_read(this.pc), bit_number = (opcode & 0x38) >>> 3, reg_code = opcode & 0x07;
        if (opcode < 0x40) {
            const op_array = [this.do_rlc, this.do_rrc, this.do_rl, this.do_rr,
                this.do_sla, this.do_sra, this.do_sll, this.do_srl];
            if (reg_code === 0)
                this.b = op_array[bit_number].call(this, this.b);
            else if (reg_code === 1)
                this.c = op_array[bit_number].call(this, this.c);
            else if (reg_code === 2)
                this.d = op_array[bit_number].call(this, this.d);
            else if (reg_code === 3)
                this.e = op_array[bit_number].call(this, this.e);
            else if (reg_code === 4)
                this.h = op_array[bit_number].call(this, this.h);
            else if (reg_code === 5)
                this.l = op_array[bit_number].call(this, this.l);
            else if (reg_code === 6)
                this.core.mem_write(this.l | (this.h << 8), op_array[bit_number].call(this, this.core.mem_read(this.l | (this.h << 8))));
            else if (reg_code === 7)
                this.a = op_array[bit_number].call(this, this.a);
        }
        else if (opcode < 0x80) {
            if (reg_code === 0)
                this.flags.Z = !(this.b & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 1)
                this.flags.Z = !(this.c & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 2)
                this.flags.Z = !(this.d & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 3)
                this.flags.Z = !(this.e & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 4)
                this.flags.Z = !(this.h & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 5)
                this.flags.Z = !(this.l & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 6)
                this.flags.Z = !((this.core.mem_read(this.l | (this.h << 8))) & (1 << bit_number)) ? 1 : 0;
            else if (reg_code === 7)
                this.flags.Z = !(this.a & (1 << bit_number)) ? 1 : 0;
            this.flags.N = 0;
            this.flags.H = 1;
            this.flags.P = this.flags.Z;
            this.flags.S = ((bit_number === 7) && !this.flags.Z) ? 1 : 0;
            this.flags.Y = ((bit_number === 5) && !this.flags.Z) ? 1 : 0;
            this.flags.X = ((bit_number === 3) && !this.flags.Z) ? 1 : 0;
        }
        else if (opcode < 0xc0) {
            if (reg_code === 0)
                this.b &= (0xff & ~(1 << bit_number));
            else if (reg_code === 1)
                this.c &= (0xff & ~(1 << bit_number));
            else if (reg_code === 2)
                this.d &= (0xff & ~(1 << bit_number));
            else if (reg_code === 3)
                this.e &= (0xff & ~(1 << bit_number));
            else if (reg_code === 4)
                this.h &= (0xff & ~(1 << bit_number));
            else if (reg_code === 5)
                this.l &= (0xff & ~(1 << bit_number));
            else if (reg_code === 6)
                this.core.mem_write(this.l | (this.h << 8), this.core.mem_read(this.l | (this.h << 8)) & ~(1 << bit_number));
            else if (reg_code === 7)
                this.a &= (0xff & ~(1 << bit_number));
        }
        else {
            if (reg_code === 0)
                this.b |= (1 << bit_number);
            else if (reg_code === 1)
                this.c |= (1 << bit_number);
            else if (reg_code === 2)
                this.d |= (1 << bit_number);
            else if (reg_code === 3)
                this.e |= (1 << bit_number);
            else if (reg_code === 4)
                this.h |= (1 << bit_number);
            else if (reg_code === 5)
                this.l |= (1 << bit_number);
            else if (reg_code === 6)
                this.core.mem_write(this.l | (this.h << 8), this.core.mem_read(this.l | (this.h << 8)) | (1 << bit_number));
            else if (reg_code === 7)
                this.a |= (1 << bit_number);
        }
        this.cycle_counter += this.cycle_counts_cb[opcode];
    };
    Z80.prototype.instructions[0xcc] = function () {
        this.do_conditional_call(!!this.flags.Z);
    };
    Z80.prototype.instructions[0xcd] = function () {
        this.push_word((this.pc + 3) & 0xffff);
        this.pc = this.core.mem_read((this.pc + 1) & 0xffff) |
            (this.core.mem_read((this.pc + 2) & 0xffff) << 8);
        this.pc = (this.pc - 1) & 0xffff;
    };
    Z80.prototype.instructions[0xce] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_adc(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xcf] = function () {
        this.do_reset(0x08);
    };
    Z80.prototype.instructions[0xd0] = function () {
        this.do_conditional_return(!this.flags.C);
    };
    Z80.prototype.instructions[0xd1] = function () {
        let result = this.pop_word();
        this.e = result & 0xff;
        this.d = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0xd2] = function () {
        this.do_conditional_absolute_jump(!this.flags.C);
    };
    Z80.prototype.instructions[0xd3] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.core.io_write((this.a << 8) | this.core.mem_read(this.pc), this.a);
    };
    Z80.prototype.instructions[0xd4] = function () {
        this.do_conditional_call(!this.flags.C);
    };
    Z80.prototype.instructions[0xd5] = function () {
        this.push_word(this.e | (this.d << 8));
    };
    Z80.prototype.instructions[0xd6] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_sub(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xd7] = function () {
        this.do_reset(0x10);
    };
    Z80.prototype.instructions[0xd8] = function () {
        this.do_conditional_return(!!this.flags.C);
    };
    Z80.prototype.instructions[0xd9] = function () {
        let temp = this.b;
        this.b = this.b_prime;
        this.b_prime = temp;
        temp = this.c;
        this.c = this.c_prime;
        this.c_prime = temp;
        temp = this.d;
        this.d = this.d_prime;
        this.d_prime = temp;
        temp = this.e;
        this.e = this.e_prime;
        this.e_prime = temp;
        temp = this.h;
        this.h = this.h_prime;
        this.h_prime = temp;
        temp = this.l;
        this.l = this.l_prime;
        this.l_prime = temp;
    };
    Z80.prototype.instructions[0xda] = function () {
        this.do_conditional_absolute_jump(!!this.flags.C);
    };
    Z80.prototype.instructions[0xdb] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.a = this.core.io_read((this.a << 8) | this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xdc] = function () {
        this.do_conditional_call(!!this.flags.C);
    };
    Z80.prototype.instructions[0xdd] = function () {
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        this.pc = (this.pc + 1) & 0xffff;
        let opcode = this.core.mem_read(this.pc), func = this.dd_instructions[opcode];
        if (func) {
            func = func.bind(this);
            func();
            this.cycle_counter += this.cycle_counts_dd[opcode];
        }
        else {
            this.pc = (this.pc - 1) & 0xffff;
            this.cycle_counter += this.cycle_counts[0];
        }
    };
    Z80.prototype.instructions[0xde] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_sbc(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xdf] = function () {
        this.do_reset(0x18);
    };
    Z80.prototype.instructions[0xe0] = function () {
        this.do_conditional_return(!this.flags.P);
    };
    Z80.prototype.instructions[0xe1] = function () {
        let result = this.pop_word();
        this.l = result & 0xff;
        this.h = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0xe2] = function () {
        this.do_conditional_absolute_jump(!this.flags.P);
    };
    Z80.prototype.instructions[0xe3] = function () {
        let temp = this.core.mem_read(this.sp);
        this.core.mem_write(this.sp, this.l);
        this.l = temp;
        temp = this.core.mem_read((this.sp + 1) & 0xffff);
        this.core.mem_write((this.sp + 1) & 0xffff, this.h);
        this.h = temp;
    };
    Z80.prototype.instructions[0xe4] = function () {
        this.do_conditional_call(!this.flags.P);
    };
    Z80.prototype.instructions[0xe5] = function () {
        this.push_word(this.l | (this.h << 8));
    };
    Z80.prototype.instructions[0xe6] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_and(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xe7] = function () {
        this.do_reset(0x20);
    };
    Z80.prototype.instructions[0xe8] = function () {
        this.do_conditional_return(!!this.flags.P);
    };
    Z80.prototype.instructions[0xe9] = function () {
        this.pc = this.l | (this.h << 8);
        this.pc = (this.pc - 1) & 0xffff;
    };
    Z80.prototype.instructions[0xea] = function () {
        this.do_conditional_absolute_jump(!!this.flags.P);
    };
    Z80.prototype.instructions[0xeb] = function () {
        let temp = this.d;
        this.d = this.h;
        this.h = temp;
        temp = this.e;
        this.e = this.l;
        this.l = temp;
    };
    Z80.prototype.instructions[0xec] = function () {
        this.do_conditional_call(!!this.flags.P);
    };
    Z80.prototype.instructions[0xed] = function () {
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        this.pc = (this.pc + 1) & 0xffff;
        let opcode = this.core.mem_read(this.pc), func = this.ed_instructions[opcode];
        if (func) {
            func = func.bind(this);
            func();
            this.cycle_counter += this.cycle_counts_ed[opcode];
        }
        else {
            this.cycle_counter += this.cycle_counts[0];
        }
    };
    Z80.prototype.instructions[0xee] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_xor(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xef] = function () {
        this.do_reset(0x28);
    };
    Z80.prototype.instructions[0xf0] = function () {
        this.do_conditional_return(!this.flags.S);
    };
    Z80.prototype.instructions[0xf1] = function () {
        let result = this.pop_word();
        this.set_flags_register(result & 0xff);
        this.a = (result & 0xff00) >>> 8;
    };
    Z80.prototype.instructions[0xf2] = function () {
        this.do_conditional_absolute_jump(!this.flags.S);
    };
    Z80.prototype.instructions[0xf3] = function () {
        this.do_delayed_di = true;
    };
    Z80.prototype.instructions[0xf4] = function () {
        this.do_conditional_call(!this.flags.S);
    };
    Z80.prototype.instructions[0xf5] = function () {
        this.push_word(this.get_flags_register() | (this.a << 8));
    };
    Z80.prototype.instructions[0xf6] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_or(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xf7] = function () {
        this.do_reset(0x30);
    };
    Z80.prototype.instructions[0xf8] = function () {
        this.do_conditional_return(!!this.flags.S);
    };
    Z80.prototype.instructions[0xf9] = function () {
        this.sp = this.l | (this.h << 8);
    };
    Z80.prototype.instructions[0xfa] = function () {
        this.do_conditional_absolute_jump(!!this.flags.S);
    };
    Z80.prototype.instructions[0xfb] = function () {
        this.do_delayed_ei = true;
    };
    Z80.prototype.instructions[0xfc] = function () {
        this.do_conditional_call(!!this.flags.S);
    };
    Z80.prototype.instructions[0xfd] = function () {
        this.r = (this.r & 0x80) | (((this.r & 0x7f) + 1) & 0x7f);
        this.pc = (this.pc + 1) & 0xffff;
        let opcode = this.core.mem_read(this.pc), func = this.dd_instructions[opcode];
        if (func) {
            let temp = this.ix;
            this.ix = this.iy;
            func = func.bind(this);
            func();
            this.iy = this.ix;
            this.ix = temp;
            this.cycle_counter += this.cycle_counts_dd[opcode];
        }
        else {
            this.pc = (this.pc - 1) & 0xffff;
            this.cycle_counter += this.cycle_counts[0];
        }
    };
    Z80.prototype.instructions[0xfe] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.do_cp(this.core.mem_read(this.pc));
    };
    Z80.prototype.instructions[0xff] = function () {
        this.do_reset(0x38);
    };
    Z80.prototype.ed_instructions = [];
    Z80.prototype.ed_instructions[0x40] = function () {
        this.b = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x41] = function () {
        this.core.io_write((this.b << 8) | this.c, this.b);
    };
    Z80.prototype.ed_instructions[0x42] = function () {
        this.do_hl_sbc(this.c | (this.b << 8));
    };
    Z80.prototype.ed_instructions[0x43] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.core.mem_write(address, this.c);
        this.core.mem_write((address + 1) & 0xffff, this.b);
    };
    Z80.prototype.ed_instructions[0x44] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x45] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x46] = function () {
        this.imode = 0;
    };
    Z80.prototype.ed_instructions[0x47] = function () {
        this.i = this.a;
    };
    Z80.prototype.ed_instructions[0x48] = function () {
        this.c = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x49] = function () {
        this.core.io_write((this.b << 8) | this.c, this.c);
    };
    Z80.prototype.ed_instructions[0x4a] = function () {
        this.do_hl_adc(this.c | (this.b << 8));
    };
    Z80.prototype.ed_instructions[0x4b] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.c = this.core.mem_read(address);
        this.b = this.core.mem_read((address + 1) & 0xffff);
    };
    Z80.prototype.ed_instructions[0x4c] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x4d] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
    };
    Z80.prototype.ed_instructions[0x4e] = function () {
        this.imode = 0;
    };
    Z80.prototype.ed_instructions[0x4f] = function () {
        this.r = this.a;
    };
    Z80.prototype.ed_instructions[0x50] = function () {
        this.d = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x51] = function () {
        this.core.io_write((this.b << 8) | this.c, this.d);
    };
    Z80.prototype.ed_instructions[0x52] = function () {
        this.do_hl_sbc(this.e | (this.d << 8));
    };
    Z80.prototype.ed_instructions[0x53] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.core.mem_write(address, this.e);
        this.core.mem_write((address + 1) & 0xffff, this.d);
    };
    Z80.prototype.ed_instructions[0x54] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x55] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x56] = function () {
        this.imode = 1;
    };
    Z80.prototype.ed_instructions[0x57] = function () {
        this.a = this.i;
        this.flags.P = this.iff2;
    };
    Z80.prototype.ed_instructions[0x58] = function () {
        this.e = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x59] = function () {
        this.core.io_write((this.b << 8) | this.c, this.e);
    };
    Z80.prototype.ed_instructions[0x5a] = function () {
        this.do_hl_adc(this.e | (this.d << 8));
    };
    Z80.prototype.ed_instructions[0x5b] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.e = this.core.mem_read(address);
        this.d = this.core.mem_read((address + 1) & 0xffff);
    };
    Z80.prototype.ed_instructions[0x5c] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x5d] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x5e] = function () {
        this.imode = 2;
    };
    Z80.prototype.ed_instructions[0x5f] = function () {
        this.a = this.r;
        this.flags.P = this.iff2;
    };
    Z80.prototype.ed_instructions[0x60] = function () {
        this.h = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x61] = function () {
        this.core.io_write((this.b << 8) | this.c, this.h);
    };
    Z80.prototype.ed_instructions[0x62] = function () {
        this.do_hl_sbc(this.l | (this.h << 8));
    };
    Z80.prototype.ed_instructions[0x63] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.core.mem_write(address, this.l);
        this.core.mem_write((address + 1) & 0xffff, this.h);
    };
    Z80.prototype.ed_instructions[0x64] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x65] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x66] = function () {
        this.imode = 0;
    };
    Z80.prototype.ed_instructions[0x67] = function () {
        let hl_value = this.core.mem_read(this.l | (this.h << 8));
        let temp1 = hl_value & 0x0f, temp2 = this.a & 0x0f;
        hl_value = ((hl_value & 0xf0) >>> 4) | (temp2 << 4);
        this.a = (this.a & 0xf0) | temp1;
        this.core.mem_write(this.l | (this.h << 8), hl_value);
        this.flags.S = (this.a & 0x80) ? 1 : 0;
        this.flags.Z = this.a ? 0 : 1;
        this.flags.H = 0;
        this.flags.P = this.get_parity(this.a) ? 1 : 0;
        this.flags.N = 0;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.ed_instructions[0x68] = function () {
        this.l = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x69] = function () {
        this.core.io_write((this.b << 8) | this.c, this.l);
    };
    Z80.prototype.ed_instructions[0x6a] = function () {
        this.do_hl_adc(this.l | (this.h << 8));
    };
    Z80.prototype.ed_instructions[0x6b] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.l = this.core.mem_read(address);
        this.h = this.core.mem_read((address + 1) & 0xffff);
    };
    Z80.prototype.ed_instructions[0x6c] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x6d] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x6e] = function () {
        this.imode = 0;
    };
    Z80.prototype.ed_instructions[0x6f] = function () {
        let hl_value = this.core.mem_read(this.l | (this.h << 8));
        let temp1 = hl_value & 0xf0, temp2 = this.a & 0x0f;
        hl_value = ((hl_value & 0x0f) << 4) | temp2;
        this.a = (this.a & 0xf0) | (temp1 >>> 4);
        this.core.mem_write(this.l | (this.h << 8), hl_value);
        this.flags.S = (this.a & 0x80) ? 1 : 0;
        this.flags.Z = this.a ? 0 : 1;
        this.flags.H = 0;
        this.flags.P = this.get_parity(this.a) ? 1 : 0;
        this.flags.N = 0;
        this.update_xy_flags(this.a);
    };
    Z80.prototype.ed_instructions[0x70] = function () {
        this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x71] = function () {
        this.core.io_write((this.b << 8) | this.c, 0);
    };
    Z80.prototype.ed_instructions[0x72] = function () {
        this.do_hl_sbc(this.sp);
    };
    Z80.prototype.ed_instructions[0x73] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.core.mem_write(address, this.sp & 0xff);
        this.core.mem_write((address + 1) & 0xffff, (this.sp >>> 8) & 0xff);
    };
    Z80.prototype.ed_instructions[0x74] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x75] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x76] = function () {
        this.imode = 1;
    };
    Z80.prototype.ed_instructions[0x78] = function () {
        this.a = this.do_in((this.b << 8) | this.c);
    };
    Z80.prototype.ed_instructions[0x79] = function () {
        this.core.io_write((this.b << 8) | this.c, this.a);
    };
    Z80.prototype.ed_instructions[0x7a] = function () {
        this.do_hl_adc(this.sp);
    };
    Z80.prototype.ed_instructions[0x7b] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= this.core.mem_read(this.pc) << 8;
        this.sp = this.core.mem_read(address);
        this.sp |= this.core.mem_read((address + 1) & 0xffff) << 8;
    };
    Z80.prototype.ed_instructions[0x7c] = function () {
        this.do_neg();
    };
    Z80.prototype.ed_instructions[0x7d] = function () {
        this.pc = (this.pop_word() - 1) & 0xffff;
        this.iff1 = this.iff2;
    };
    Z80.prototype.ed_instructions[0x7e] = function () {
        this.imode = 2;
    };
    Z80.prototype.ed_instructions[0xa0] = function () {
        this.do_ldi();
    };
    Z80.prototype.ed_instructions[0xa1] = function () {
        this.do_cpi();
    };
    Z80.prototype.ed_instructions[0xa2] = function () {
        this.do_ini();
    };
    Z80.prototype.ed_instructions[0xa3] = function () {
        this.do_outi();
    };
    Z80.prototype.ed_instructions[0xa8] = function () {
        this.do_ldd();
    };
    Z80.prototype.ed_instructions[0xa9] = function () {
        this.do_cpd();
    };
    Z80.prototype.ed_instructions[0xaa] = function () {
        this.do_ind();
    };
    Z80.prototype.ed_instructions[0xab] = function () {
        this.do_outd();
    };
    Z80.prototype.ed_instructions[0xb0] = function () {
        this.do_ldi();
        if (this.b || this.c) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xb1] = function () {
        this.do_cpi();
        if (!this.flags.Z && (this.b || this.c)) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xb2] = function () {
        this.do_ini();
        if (this.b) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xb3] = function () {
        this.do_outi();
        if (this.b) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xb8] = function () {
        this.do_ldd();
        if (this.b || this.c) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xb9] = function () {
        this.do_cpd();
        if (!this.flags.Z && (this.b || this.c)) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xba] = function () {
        this.do_ind();
        if (this.b) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.ed_instructions[0xbb] = function () {
        this.do_outd();
        if (this.b) {
            this.cycle_counter += 5;
            this.pc = (this.pc - 2) & 0xffff;
        }
    };
    Z80.prototype.dd_instructions = [];
    Z80.prototype.dd_instructions[0x09] = function () {
        this.do_ix_add(this.c | (this.b << 8));
    };
    Z80.prototype.dd_instructions[0x19] = function () {
        this.do_ix_add(this.e | (this.d << 8));
    };
    Z80.prototype.dd_instructions[0x21] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.ix = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        this.ix |= (this.core.mem_read(this.pc) << 8);
    };
    Z80.prototype.dd_instructions[0x22] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= (this.core.mem_read(this.pc) << 8);
        this.core.mem_write(address, this.ix & 0xff);
        this.core.mem_write((address + 1) & 0xffff, (this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0x23] = function () {
        this.ix = (this.ix + 1) & 0xffff;
    };
    Z80.prototype.dd_instructions[0x24] = function () {
        this.ix = (this.do_inc(this.ix >>> 8) << 8) | (this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x25] = function () {
        this.ix = (this.do_dec(this.ix >>> 8) << 8) | (this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x26] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.ix = (this.core.mem_read(this.pc) << 8) | (this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x29] = function () {
        this.do_ix_add(this.ix);
    };
    Z80.prototype.dd_instructions[0x2a] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let address = this.core.mem_read(this.pc);
        this.pc = (this.pc + 1) & 0xffff;
        address |= (this.core.mem_read(this.pc) << 8);
        this.ix = this.core.mem_read(address);
        this.ix |= (this.core.mem_read((address + 1) & 0xffff) << 8);
    };
    Z80.prototype.dd_instructions[0x2b] = function () {
        this.ix = (this.ix - 1) & 0xffff;
    };
    Z80.prototype.dd_instructions[0x2c] = function () {
        this.ix = this.do_inc(this.ix & 0xff) | (this.ix & 0xff00);
    };
    Z80.prototype.dd_instructions[0x2d] = function () {
        this.ix = this.do_dec(this.ix & 0xff) | (this.ix & 0xff00);
    };
    Z80.prototype.dd_instructions[0x2e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        this.ix = (this.core.mem_read(this.pc) & 0xff) | (this.ix & 0xff00);
    };
    Z80.prototype.dd_instructions[0x34] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc)), value = this.core.mem_read((offset + this.ix) & 0xffff);
        this.core.mem_write((offset + this.ix) & 0xffff, this.do_inc(value));
    };
    Z80.prototype.dd_instructions[0x35] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc)), value = this.core.mem_read((offset + this.ix) & 0xffff);
        this.core.mem_write((offset + this.ix) & 0xffff, this.do_dec(value));
    };
    Z80.prototype.dd_instructions[0x36] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.pc = (this.pc + 1) & 0xffff;
        this.core.mem_write((this.ix + offset) & 0xffff, this.core.mem_read(this.pc));
    };
    Z80.prototype.dd_instructions[0x39] = function () {
        this.do_ix_add(this.sp);
    };
    Z80.prototype.dd_instructions[0x44] = function () {
        this.b = (this.ix >>> 8) & 0xff;
    };
    Z80.prototype.dd_instructions[0x45] = function () {
        this.b = this.ix & 0xff;
    };
    Z80.prototype.dd_instructions[0x46] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.b = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x4c] = function () {
        this.c = (this.ix >>> 8) & 0xff;
    };
    Z80.prototype.dd_instructions[0x4d] = function () {
        this.c = this.ix & 0xff;
    };
    Z80.prototype.dd_instructions[0x4e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.c = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x54] = function () {
        this.d = (this.ix >>> 8) & 0xff;
    };
    Z80.prototype.dd_instructions[0x55] = function () {
        this.d = this.ix & 0xff;
    };
    Z80.prototype.dd_instructions[0x56] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.d = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x5c] = function () {
        this.e = (this.ix >>> 8) & 0xff;
    };
    Z80.prototype.dd_instructions[0x5d] = function () {
        this.e = this.ix & 0xff;
    };
    Z80.prototype.dd_instructions[0x5e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.e = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x60] = function () {
        this.ix = (this.ix & 0xff) | (this.b << 8);
    };
    Z80.prototype.dd_instructions[0x61] = function () {
        this.ix = (this.ix & 0xff) | (this.c << 8);
    };
    Z80.prototype.dd_instructions[0x62] = function () {
        this.ix = (this.ix & 0xff) | (this.d << 8);
    };
    Z80.prototype.dd_instructions[0x63] = function () {
        this.ix = (this.ix & 0xff) | (this.e << 8);
    };
    Z80.prototype.dd_instructions[0x64] = function () {
    };
    Z80.prototype.dd_instructions[0x65] = function () {
        this.ix = (this.ix & 0xff) | ((this.ix & 0xff) << 8);
    };
    Z80.prototype.dd_instructions[0x66] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.h = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x67] = function () {
        this.ix = (this.ix & 0xff) | (this.a << 8);
    };
    Z80.prototype.dd_instructions[0x68] = function () {
        this.ix = (this.ix & 0xff00) | this.b;
    };
    Z80.prototype.dd_instructions[0x69] = function () {
        this.ix = (this.ix & 0xff00) | this.c;
    };
    Z80.prototype.dd_instructions[0x6a] = function () {
        this.ix = (this.ix & 0xff00) | this.d;
    };
    Z80.prototype.dd_instructions[0x6b] = function () {
        this.ix = (this.ix & 0xff00) | this.e;
    };
    Z80.prototype.dd_instructions[0x6c] = function () {
        this.ix = (this.ix & 0xff00) | (this.ix >>> 8);
    };
    Z80.prototype.dd_instructions[0x6d] = function () {
    };
    Z80.prototype.dd_instructions[0x6e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.l = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x6f] = function () {
        this.ix = (this.ix & 0xff00) | this.a;
    };
    Z80.prototype.dd_instructions[0x70] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.b);
    };
    Z80.prototype.dd_instructions[0x71] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.c);
    };
    Z80.prototype.dd_instructions[0x72] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.d);
    };
    Z80.prototype.dd_instructions[0x73] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.e);
    };
    Z80.prototype.dd_instructions[0x74] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.h);
    };
    Z80.prototype.dd_instructions[0x75] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.l);
    };
    Z80.prototype.dd_instructions[0x77] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.core.mem_write((this.ix + offset) & 0xffff, this.a);
    };
    Z80.prototype.dd_instructions[0x7c] = function () {
        this.a = (this.ix >>> 8) & 0xff;
    };
    Z80.prototype.dd_instructions[0x7d] = function () {
        this.a = this.ix & 0xff;
    };
    Z80.prototype.dd_instructions[0x7e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.a = this.core.mem_read((this.ix + offset) & 0xffff);
    };
    Z80.prototype.dd_instructions[0x84] = function () {
        this.do_add((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0x85] = function () {
        this.do_add(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x86] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_add(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0x8c] = function () {
        this.do_adc((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0x8d] = function () {
        this.do_adc(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x8e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_adc(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0x94] = function () {
        this.do_sub((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0x95] = function () {
        this.do_sub(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x96] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_sub(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0x9c] = function () {
        this.do_sbc((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0x9d] = function () {
        this.do_sbc(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0x9e] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_sbc(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0xa4] = function () {
        this.do_and((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0xa5] = function () {
        this.do_and(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0xa6] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_and(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0xac] = function () {
        this.do_xor((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0xad] = function () {
        this.do_xor(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0xae] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_xor(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0xb4] = function () {
        this.do_or((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0xb5] = function () {
        this.do_or(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0xb6] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_or(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0xbc] = function () {
        this.do_cp((this.ix >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0xbd] = function () {
        this.do_cp(this.ix & 0xff);
    };
    Z80.prototype.dd_instructions[0xbe] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.do_cp(this.core.mem_read((this.ix + offset) & 0xffff));
    };
    Z80.prototype.dd_instructions[0xcb] = function () {
        this.pc = (this.pc + 1) & 0xffff;
        let offset = this.get_signed_offset_byte(this.core.mem_read(this.pc));
        this.pc = (this.pc + 1) & 0xffff;
        let opcode = this.core.mem_read(this.pc), value;
        if (opcode < 0x40) {
            const ddcb_functions = [this.do_rlc, this.do_rrc, this.do_rl, this.do_rr,
                this.do_sla, this.do_sra, this.do_sll, this.do_srl];
            let func = ddcb_functions[(opcode & 0x38) >>> 3], value = func.call(this, this.core.mem_read((this.ix + offset) & 0xffff));
            this.core.mem_write((this.ix + offset) & 0xffff, value);
        }
        else {
            let bit_number = (opcode & 0x38) >>> 3;
            if (opcode < 0x80) {
                this.flags.N = 0;
                this.flags.H = 1;
                this.flags.Z = !(this.core.mem_read((this.ix + offset) & 0xffff) & (1 << bit_number)) ? 1 : 0;
                this.flags.P = this.flags.Z;
                this.flags.S = ((bit_number === 7) && !this.flags.Z) ? 1 : 0;
            }
            else if (opcode < 0xc0) {
                value = this.core.mem_read((this.ix + offset) & 0xffff) & ~(1 << bit_number) & 0xff;
                this.core.mem_write((this.ix + offset) & 0xffff, value);
            }
            else {
                value = this.core.mem_read((this.ix + offset) & 0xffff) | (1 << bit_number);
                this.core.mem_write((this.ix + offset) & 0xffff, value);
            }
        }
        if (value !== undefined) {
            if ((opcode & 0x07) === 0)
                this.b = value;
            else if ((opcode & 0x07) === 1)
                this.c = value;
            else if ((opcode & 0x07) === 2)
                this.d = value;
            else if ((opcode & 0x07) === 3)
                this.e = value;
            else if ((opcode & 0x07) === 4)
                this.h = value;
            else if ((opcode & 0x07) === 5)
                this.l = value;
            else if ((opcode & 0x07) === 7)
                this.a = value;
        }
        this.cycle_counter += this.cycle_counts_cb[opcode] + 8;
    };
    Z80.prototype.dd_instructions[0xe1] = function () {
        this.ix = this.pop_word();
    };
    Z80.prototype.dd_instructions[0xe3] = function () {
        let temp = this.ix;
        this.ix = this.core.mem_read(this.sp);
        this.ix |= this.core.mem_read((this.sp + 1) & 0xffff) << 8;
        this.core.mem_write(this.sp, temp & 0xff);
        this.core.mem_write((this.sp + 1) & 0xffff, (temp >>> 8) & 0xff);
    };
    Z80.prototype.dd_instructions[0xe5] = function () {
        this.push_word(this.ix);
    };
    Z80.prototype.dd_instructions[0xe9] = function () {
        this.pc = (this.ix - 1) & 0xffff;
    };
    Z80.prototype.dd_instructions[0xf9] = function () {
        this.sp = this.ix;
    };
    Z80.prototype.cycle_counts = [
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
        5, 10, 10, 4, 10, 11, 7, 11, 5, 4, 10, 4, 10, 0, 7, 11
    ];
    Z80.prototype.cycle_counts_ed = [
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
    Z80.prototype.cycle_counts_cb = [
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
    Z80.prototype.cycle_counts_dd = [
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
    class ExidyZ80 {
        constructor(memory, input, output) {
            this.cpu = new Z80({
                mem_read: (address) => { return memory.readByte(address); },
                mem_write: (address, data) => { memory.writeByte(address, data); },
                io_read: (address) => { return input.readByte(address); },
                io_write: (address, data) => { output.writeByte(address, data); }
            }).api;
        }
        reset(address) {
            this.cpu.reset(address);
        }
        executeInstruction() {
            return this.cpu.run_instruction();
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
define("ExidyTapeUnitMotorControl", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class TapeUnitMotorControl {
        constructor(motorMask) {
            this._motorOn = false;
            this._baud = 300;
            this._motorMask = motorMask;
        }
        writeByte(data) {
            let motorOn = (this._motorMask & data) !== 0;
            if (motorOn && !this._motorOn) {
                this._baud = (data & 0x40) === 0 ? 300 : 1200;
            }
            else if (!motorOn && this._motorOn) {
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
define("ExidyTapeUnit", ["require", "exports"], function (require, exports) {
    'use strict';
    Object.defineProperty(exports, "__esModule", { value: true });
    class TapeUnit {
        constructor(motorControl) {
            this._motorControl = motorControl;
        }
        get readyForRead() {
            return this.tape && this._motorControl.motorOn;
        }
        get readyForWrite() {
            return this.tape && this._motorControl.motorOn;
        }
        writeByte(data) {
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
    const defaultRoms = [
        { name: 'exmo1-1.dat', address: 0xE000 },
        { name: 'exmo1-2.dat', address: 0xE800 },
        { name: 'exchr-1.dat', address: 0xF800 },
        { name: 'diskboot.dat', address: 0xBC00 }
    ];
    const CYCLES_PER_DISK_TICK = 100000;
    class ExidySorcerer {
        constructor(filesystem) {
            this.typeSystem = new ExidyTapeSystem_1.default();
            this.centronicsSystem = new ExidyCentronicsSystem_1.default();
            this._keyboard = new ExidyKeyboard_1.default();
            this._govern = true;
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
            this.ready = Promise.all(defaultRoms.map((romConfig) => {
                return filesystem.read('roms/' + romConfig.name).then((data) => {
                    this.memorySystem.loadRom(data, romConfig.address);
                });
            })).then(() => {
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
        get keyboard() {
            return this._keyboard;
        }
        get screenCanvas() {
            return this.memorySystem.screenCanvas;
        }
        ejectRom() {
            this.memorySystem.ejectRom(0xc000, 0x2000);
        }
        loadRomFromArray(data) {
            this.memorySystem.loadRom(data, 0xC000);
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
        run() {
            let t = 0;
            let g = 100;
            let c = 0;
            let d = 10;
            let interval = setInterval(() => {
                c += this.step();
            }, d);
            this.ready.then(() => {
                setInterval(() => {
                    if (this._govern) {
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
define("index", ["require", "exports", "BinaryAjax", "ExidyArrayDisk", "ExidyArrayTape", "ExidyBrowserKeyboard", "ExidyCentronicsSystem", "ExidyCharacters", "ExidyDiskDrive", "ExidyDiskSystem", "ExidyDiskConsts", "ExidyElementPrinter", "ExidyFileBinaryAjax", "ExidyKeyboard", "ExidyMemoryNone", "ExidyMemoryRam", "ExidyMemoryRom", "ExidyMemorySystem", "ExidyScreen", "ExidySorcerer", "ExidyTapeSystem", "ExidyTapeUnitMotorControl", "ExidyTapeUnit"], function (require, exports, BinaryAjax_2, ExidyArrayDisk_2, ExidyArrayTape_2, ExidyBrowserKeyboard_1, ExidyCentronicsSystem_2, ExidyCharacters_2, ExidyDiskDrive_2, ExidyDiskSystem_2, ExidyDiskConsts_3, ExidyElementPrinter_1, ExidyFileBinaryAjax_1, ExidyKeyboard_2, ExidyMemoryNone_2, ExidyMemoryRam_4, ExidyMemoryRom_2, ExidyMemorySystem_2, ExidyScreen_2, ExidySorcerer_1, ExidyTapeSystem_2, ExidyTapeUnitMotorControl_2, ExidyTapeUnit_2) {
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
    exports.ExidyMemoryNone = ExidyMemoryNone_2.default;
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
