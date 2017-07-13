"use strict"

import { ExidyZ80 as Z80 } from './ExidyZ80'
import ExidyFile from './ExidyFile'
import DropZone from './DropZone'
import MemorySystem from './ExidyMemorySystem'
import { IoSystem } from './ExidyIo'
import Keyboard from './ExidyKeyboard'
import ExidyArrayDisk from './ExidyArrayDisk'
import ExidyDiskSystem from './ExidyDiskSystem'
import TapeSystem from './ExidyTapeSystem'
import ArrayTape from './ExidyArrayTape'
import Centronics from './ExidyCentronics'
import CentronicsSystem from './ExidyCentronicsSystem'

const defaultRoms = [
	{ name: "exmo1-1.dat", address: 0xE000 },
	{ name: "exmo1-2.dat", address: 0xE800 },
	{ name: "exchr-1.dat", address: 0xF800 },
	{ name: "diskboot.dat", address: 0xBC00 }
];

const CYCLES_PER_DISK_TICK = 100000;

export default class ExidySorcerer {

	private cpu : Z80;
	private memorySystem : MemorySystem;
	private io : IoSystem;
	private ready : Promise<any>;
	private filesystem : ExidyFile;
	private diskSystem : ExidyDiskSystem;
	private cycles : number;
	private typeSystem = new TapeSystem();
	private centronicsSystem = new CentronicsSystem();

	public constructor(
		filesystem : ExidyFile,
		keyboard : Keyboard,
		byteCanvas : HTMLCanvasElement,
		charsCanvas : HTMLCanvasElement,
		screenCanvas : HTMLCanvasElement
	) {
		this.filesystem = filesystem;
		this.memorySystem = new MemorySystem(byteCanvas, charsCanvas, screenCanvas);

		this.io = new IoSystem();
		this.io.output.addHandler(0xFE, keyboard);
		this.io.input.setHandler(0xFE, keyboard);
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

		new DropZone(screenCanvas, (buffer) => {
			this.loadSnpFromArray(new Uint8Array(buffer));
		});
	}

	private loadRomFromArray(data : Uint8Array) : void {
		this.memorySystem.loadRom(data, 0xC000);
	}

	private loadSnpFromArray(data : Uint8Array) : void {
		this.memorySystem.load(data, 0x0000, 28);
		this.memorySystem.updateCharacters();
		this.memorySystem.updateScreen();
		this.cpu.load(data);
	}

	public load(snap : string) : void {
		this.ready = this.ready.then(() => {
			return this.filesystem.read('snaps/' + snap).then((data) => {
				this.loadSnpFromArray(data);
			});
		});
	}

	public loadRomPack(rom : string) : void {
		this.ready = this.ready.then(() => {
			return this.filesystem.read('rom-packs/' + rom).then((data) => {
				this.loadRomFromArray(data);
			});
		});
	}

	public loadDisk(unit : number, file : string) : void {
		this.ready = this.ready.then(() => {
			return this.filesystem.read('disks/' + file).then((data) => {
				let disk = new ExidyArrayDisk(data);
				this.diskSystem.insertDisk(disk, unit);
			});
		});
	}

	public loadTape(unit : number, file : string) : void {
		this.ready = this.ready.then(() => {
			return this.filesystem.read('tapes/' + file).then((data) => {
				this.typeSystem.units[unit].tape = new ArrayTape(data);
			});
		});
	}

	public set centronics(device : Centronics) {
		this.centronicsSystem.device = device;
	}

	public reset() : void {
		this.cycles = 0;
		this.cpu.reset(0xE000);
	}

	private step() : number {
		let c = 0;
		for(let i = 0; i < 3000; ++i) {
			let q = this.cpu.executeInstruction();
			this.cycles += q;
			c += q;
			if(this.cycles > CYCLES_PER_DISK_TICK) {
				this.cycles -= CYCLES_PER_DISK_TICK;
				this.diskSystem.tick();
			}
		}
		return c;
	}

	public run() : void {
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
				if(t > 100000 && d > 0) {
					d -= 1;
					t = 0;
					clearInterval(interval);
					interval = setInterval(() => {
						c += this.step();
					}, d);
				}
				else if(t < -100000) {
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
