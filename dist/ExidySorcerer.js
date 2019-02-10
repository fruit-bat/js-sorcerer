'use strict';
import { ExidyZ80 as Z80 } from './ExidyZ80';
import DropZone from './DropZone';
import MemorySystem from './ExidyMemorySystem';
import { IoSystem } from './ExidyIo';
import Keyboard from './ExidyKeyboard';
import ExidyArrayDisk from './ExidyArrayDisk';
import ExidyDiskSystem from './ExidyDiskSystem';
import TapeSystem from './ExidyTapeSystem';
import ArrayTape from './ExidyArrayTape';
import CentronicsSystem from './ExidyCentronicsSystem';
const defaultRoms = [
    { name: 'exmo1-1.dat', address: 0xE000 },
    { name: 'exmo1-2.dat', address: 0xE800 },
    { name: 'exchr-1.dat', address: 0xF800 },
    { name: 'diskboot.dat', address: 0xBC00 }
];
const CYCLES_PER_DISK_TICK = 100000;
export default class ExidySorcerer {
    constructor(filesystem) {
        this.typeSystem = new TapeSystem();
        this.centronicsSystem = new CentronicsSystem();
        this._keyboard = new Keyboard();
        this._govern = true;
        this._running = false;
        this.filesystem = filesystem;
        this.memorySystem = new MemorySystem();
        this.io = new IoSystem();
        this.io.output.addHandler(0xFE, this._keyboard);
        this.io.input.setHandler(0xFE, this._keyboard);
        this.io.output.addHandler(0xFE, this.typeSystem.control);
        this.io.output.addHandler(0xFC, this.typeSystem.dataOutput);
        this.io.input.setHandler(0xFC, this.typeSystem.dataInput);
        this.io.input.setHandler(0xFD, this.typeSystem.status);
        this.io.input.setHandler(0xFF, this.centronicsSystem);
        this.io.output.addHandler(0xFF, this.centronicsSystem);
        this.cpu = new Z80(this.memorySystem.memory, this.io.input, this.io.output);
        this.ready = Promise.all(defaultRoms.map((romConfig) => {
            return filesystem.read('roms/' + romConfig.name).then((data) => {
                this.memorySystem.loadRom(data, romConfig.address);
            });
        })).then(() => {
            this.diskSystem = new ExidyDiskSystem(this.memorySystem);
        }).then(() => {
            this.memorySystem.updateCharacters();
            this.memorySystem.updateScreen();
            this.reset();
        });
        new DropZone(this.memorySystem.screenCanvas, (buffer) => {
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
                let disk = new ExidyArrayDisk(data);
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
                this.typeSystem.units[unit].tape = new ArrayTape(data);
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
