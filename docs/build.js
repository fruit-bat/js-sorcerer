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
define("ExidyDisk", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SECTORS_PER_TRACK = 16;
    exports.NUMBER_OF_TRACKS = 77;
    exports.BYTES_PER_SECTOR = 256 + 14;
});
define("ExidyArrayDisk", ["require", "exports", "ExidyDisk"], function (require, exports, ExidyDisk_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExidyArrayDisk {
        constructor(data) {
            this._data = data;
        }
        toIndex(track, sector, offset) {
            return (sector * ExidyDisk_1.BYTES_PER_SECTOR) + (track * ExidyDisk_1.SECTORS_PER_TRACK * ExidyDisk_1.BYTES_PER_SECTOR) + offset;
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
    "use strict";
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
define("ExidyCentronics", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyCentronicsSystem", ["require", "exports"], function (require, exports) {
    "use strict";
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
define("ExidyCpu", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyDiskDrive", ["require", "exports", "ExidyDisk"], function (require, exports, ExidyDisk_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ACTIVE_FOR_TICKS = 800;
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
            return "ABCD".charAt(this._unitNumber);
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
            return this._trackNumber == 0;
        }
        stepForward() {
            if (this._trackNumber < (ExidyDisk_2.NUMBER_OF_TRACKS - 1)) {
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
            if (this._activeCount == 0 && this._disk != null) {
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
                if (this._sectorIndex < ExidyDisk_2.BYTES_PER_SECTOR) {
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
                if (this._sectorNumber >= ExidyDisk_2.SECTORS_PER_TRACK) {
                    this._sectorNumber = 0;
                }
                this._newSector = true;
                this._activeCount--;
                if (!this.active()) {
                    if (this._disk != null) {
                        this._disk.deactivate();
                    }
                }
            }
        }
    }
    exports.default = ExidyDiskDrive;
});
define("ExidyMemory", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("ExidyMemorySystem", ["require", "exports"], function (require, exports) {
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
            this.handlers.fill(handler, address, address + length);
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
            this.screenCtx.drawImage(this.charsCanvas, char << 3, 0, 8, 8, col << 3, row << 3, 8, 8);
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
            for (let address = SCREEN_START; address < SCREEN_START + SCREEN_SIZE_BYTES; ++address) {
                let char = this.readByte(address);
                this.updateByte(address, char);
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
            this._memory.set(data.subarray(start), address);
        }
        loadRom(data, address) {
            this._memory.set(data, address);
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
        setHandler(address, length, handler) {
            this.multplexor.setHandler(address, length, handler);
        }
    }
    exports.default = MemorySystem;
});
define("ExidyDiskSystem", ["require", "exports", "ExidyDiskDrive"], function (require, exports, ExidyDiskDrive_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const MEM_DISK_REG_START = 0xBE00;
    const MEM_DISK_REG_LEN = 3;
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
            return this._activeDrive == null ? false : this._activeDrive.dataReady();
        }
        home() {
            return this._activeDrive != null ? this._activeDrive.home() : false;
        }
        stepForward() {
            if (this._activeDrive != null) {
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
            return this._activeDrive != null;
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
            return this._activeDrive != null ? this._activeDrive.readReg0() : 0;
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
            return this._activeDrive == null ? 0 : this._activeDrive.readReg2();
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
            if (this._activeDrive != null) {
                if (this._activeDrive.active() == false) {
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
            this._encodeHTMLmap = {
                "&": "&amp;",
                "'": "&#39;",
                '"': "&quot;",
                "<": "&lt;",
                ">": "&gt;"
            };
            this._element = element;
        }
        readByte() {
            return 0x7f;
        }
        escape(char) {
            let r = this._encodeHTMLmap.char;
            return r ? r : char;
        }
        writeByte(data) {
            let clock = (data & 0x80) != 0;
            if (!clock) {
                let char = data & 0x7f;
                if (char == 0x0a)
                    return;
                this._element.innerHTML += this.escape(String.fromCharCode(char));
            }
        }
    }
    exports.default = ElementPrinter;
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
            let handlersForPort = this.handlers[address & 0xFF];
            for (let i = 0; i < handlersForPort.length; ++i) {
                handlersForPort[i].writeByte(address, data);
            }
        }
        addHandler(address, handler) {
            let handlersForPort = this.handlers[address & 0xFF];
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
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TapeUnitMotorControl {
        constructor(motorMask) {
            this._motorOn = false;
            this._baud = 300;
            this._motorMask = motorMask;
        }
        writeByte(data) {
            let motorOn = (this._motorMask & data) != 0;
            if (motorOn && !this._motorOn) {
                console.log('Tape motor on');
                this._baud = (data & 0x40) == 0 ? 300 : 1200;
            }
            else if (!motorOn && this._motorOn) {
                console.log('Tape motor off');
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
    "use strict";
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
    "use strict";
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
    }
    exports.default = TapeSystem;
});
define("ExidySorcerer", ["require", "exports", "ExidyZ80", "DropZone", "ExidyMemorySystem", "ExidyIo", "ExidyArrayDisk", "ExidyDiskSystem", "ExidyTapeSystem", "ExidyArrayTape", "ExidyCentronicsSystem"], function (require, exports, ExidyZ80_1, DropZone_1, ExidyMemorySystem_1, ExidyIo_1, ExidyArrayDisk_1, ExidyDiskSystem_1, ExidyTapeSystem_1, ExidyArrayTape_1, ExidyCentronicsSystem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const defaultRoms = [
        { name: "exmo1-1.dat", address: 0xE000 },
        { name: "exmo1-2.dat", address: 0xE800 },
        { name: "exchr-1.dat", address: 0xF800 },
        { name: "diskboot.dat", address: 0xBC00 }
    ];
    const CYCLES_PER_DISK_TICK = 100000;
    class ExidySorcerer {
        constructor(filesystem, keyboard, byteCanvas, charsCanvas, screenCanvas) {
            this.typeSystem = new ExidyTapeSystem_1.default();
            this.centronicsSystem = new ExidyCentronicsSystem_1.default();
            this.filesystem = filesystem;
            this.memorySystem = new ExidyMemorySystem_1.default(byteCanvas, charsCanvas, screenCanvas);
            this.io = new ExidyIo_1.IoSystem();
            this.io.output.addHandler(0xFE, keyboard);
            this.io.input.setHandler(0xFE, keyboard);
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
            new DropZone_1.default(screenCanvas, (buffer) => {
                this.loadSnpFromArray(new Uint8Array(buffer));
            });
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
                }, g);
            });
        }
    }
    exports.default = ExidySorcerer;
});
define("main", ["require", "exports", "ExidySorcerer", "ExidyFileBinaryAjax", "ExidyBrowserKeyboard", "ExidyElementPrinter"], function (require, exports, ExidySorcerer_1, ExidyFileBinaryAjax_1, ExidyBrowserKeyboard_1, ExidyElementPrinter_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let screenCanvas = document.getElementById('exidyScreen');
    let printerPaper = document.getElementById('exidyPaper');
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
    let printer = new ExidyElementPrinter_1.default(printerPaper);
    exidySorcerer.run();
});
