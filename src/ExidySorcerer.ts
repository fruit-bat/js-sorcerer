'use strict';

import { ExidyZ80 as Z80 } from './ExidyZ80';
import ExidyFile from './ExidyFile';
import DropZone from './DropZone';
import MemorySystem from './ExidyMemorySystem';
import { IoSystem } from './ExidyIo';
import Keyboard from './ExidyKeyboard';
import ExidyArrayDisk from './ExidyArrayDisk';
import ExidyDiskSystem from './ExidyDiskSystem';
import ExidyDisk from './ExidyDisk';
import TapeSystem from './ExidyTapeSystem';
import ArrayTape from './ExidyArrayTape';
import Centronics from './ExidyCentronics';
import CentronicsSystem from './ExidyCentronicsSystem';
import MemoryRegion from './ExidyMemoryRegion';

const CYCLES_PER_DISK_TICK = 100000;

export default class ExidySorcerer {

    private cpu: Z80;
    private memorySystem: MemorySystem;
    private io: IoSystem;
    private ready: Promise<any>;
    private filesystem: ExidyFile;
    private diskSystem: ExidyDiskSystem;
    private cycles: number;
    private typeSystem = new TapeSystem();
    private centronicsSystem = new CentronicsSystem();
    private _keyboard = new Keyboard();
    private _govern: Boolean = true;
    private _running: Boolean = false;

    private readRom(name: string): Promise<Uint8Array> {
        return this.filesystem.read('roms/' + name);
    }

    private readMonitorRom() : Promise<Uint8Array> {
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

    public constructor(
        filesystem: ExidyFile) {
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

    public get keyboard(): Keyboard {
        return this._keyboard;
    }

    public get screenCanvas(): HTMLCanvasElement {
        return this.memorySystem.screenCanvas;
    }

    public ejectRom(): void {
      this.memorySystem.ejectRomPack8K();
    }

    public loadRomFromArray(data: Uint8Array): void {
        this.memorySystem.loadRomPack8K(data);
    }

    private loadSnpFromArray(data: Uint8Array): void {
        this.memorySystem.load(data, 0x0000, 28);
        this.memorySystem.updateCharacters();
        this.memorySystem.updateScreen();
        this.cpu.load(data);
    }

    public obtainDiskSystem(): Promise<ExidyDiskSystem> {
      return this.ready.then(() => {
        return this.diskSystem;
      });
    }

    public load(snap: string): void {
        this.ready = this.ready.then(() => {
            return this.filesystem.read('snaps/' + snap).then((data) => {
                this.loadSnpFromArray(data);
            });
        });
    }

    public loadRomPack(rom: string): void {
        this.ready = this.ready.then(() => {
            return this.filesystem.read('rom-packs/' + rom).then((data) => {
                this.loadRomFromArray(data);
            });
        });
    }

    public loadDisk(unit: number, file: string): void {
        this.ready = this.ready.then(() => {
            return this.filesystem.read('disks/' + file).then((data) => {
                let disk = new ExidyArrayDisk(data);
                this.diskSystem.insertDisk(disk, unit);
            });
        });
    }

    public obtainTapeSystem(): Promise<TapeSystem> {
      return this.ready.then(() => {
        return this.typeSystem;
      });
    }

    public loadTape(unit: number, file: string): void {
        this.ready = this.ready.then(() => {
            return this.filesystem.read('tapes/' + file).then((data) => {
                this.typeSystem.units[unit].tape = new ArrayTape(data);
            });
        });
    }

    public set centronics(device: Centronics) {
        this.centronicsSystem.device = device;
    }

    public set govern(govern: Boolean) {
      console.log('govern: ' + govern);
      this._govern = govern;
    }

    public getMem(start, length): Uint8Array {
      return this.memorySystem.getMem(start, length);
    }

    public getMemRegions(): Array<MemoryRegion> {
      return this.memorySystem.getRegions();
    }

    public reset(): void {
        this.cycles = 0;
        this.cpu.reset(0xE000);
    }

    private step(): number {
        let c = 0;
        for (let i = 0; i < 3000; ++i) {
            let q = this.cpu.executeInstruction();
            this.cycles += q;
            c += q;
            if (this.cycles > CYCLES_PER_DISK_TICK) {
                this.cycles -= CYCLES_PER_DISK_TICK;
                this.diskSystem.tick();
            }
            //this.cpu.interrupt(false, 0);
        }
        return c;
    }

    public stop(): void {
      this._running = false;
    }

    public run(): void {
        if(this._running) return;
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
                  t = 0; c = 0;
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
