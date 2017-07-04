"use strict"

import { ExidyZ80 as Z80 } from './ExidyZ80'
import ExidyFile from './ExidyFile'
import { MemorySystem } from './ExidyMemory'

const defaultRoms = [
	{ name: "exmo1-1.dat", address: 0xE000 },
	{ name: "exmo1-2.dat", address: 0xE800 },
	{ name: "exchr-1.dat", address: 0xF800 },
	{ name: "diskboot.dat", address: 0xBC00 }
];

export default class ExidySorcerer {

	private cpu : Z80;
	private memorySystem : MemorySystem;
	private ready : Promise<any>;
	private filesystem

	public constructor(
		filesystem : ExidyFile,
		byteCanvas : HTMLCanvasElement,
		charsCanvas : HTMLCanvasElement,
		screenCanvas : HTMLCanvasElement
	) {
		this.filesystem = filesystem;
		this.memorySystem = new MemorySystem(byteCanvas, charsCanvas, screenCanvas);
		this.cpu = new Z80(this.memorySystem.memory);

		this.ready = Promise.all(defaultRoms.map((romConfig) => {
			return filesystem.read('roms/' + romConfig.name).then((data) => {
				this.memorySystem.loadRom(data, romConfig.address);
				this.memorySystem.updateCharacters();
				this.memorySystem.updateScreen();
				this.reset();
				return true;
			});
		}));
	}

	public load(snap : string) : void {
		this.ready = this.ready.then(() => {
			return this.filesystem.read('snaps/' + snap).then((data) => {
				this.memorySystem.load(data, 0x0000, 28);
				this.memorySystem.updateCharacters();
				this.memorySystem.updateScreen();
				this.cpu.load(data);
				return true;
			});
		});
	}

	public reset() : void {
		this.cpu.reset(0xE000);
	}

	private step() : void {
		for(let i = 0; i < 3000; ++i) {
			this.cpu.executeInstruction();
		}
	}

	public run() : void {
		this.ready.then(() => {
			setInterval(() => {
				this.step();
			}, 0);
		});
	}
}
