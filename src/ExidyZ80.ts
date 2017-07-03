import { Memory } from './ExidyMemory'

declare function Z80(core : any) : void;

export class ExidyZ80 {

	private cpu : any;

	public constructor(memory : Memory) {
		this.cpu = new Z80({
			mem_read : (address) => { return memory.readByte(address); },
			mem_write : (address, data) => { memory.writeByte(address, data); },
			io_read : (adddress) => { return 0xff; },
			io_write :  (address, data) => {}
		});
	}

	public reset(address) : void {
		this.cpu.reset(address);
	}

	public executeInstruction() : void {
		this.cpu.run_instruction();
	}

	public load(data : Uint8Array) :void {
		this.cpu.load({
			i : data[0],
			l_prime : data[1],
			h_prime : data[2],
			e_prime : data[3],
			d_prime : data[4],
			c_prime : data[5],
			b_prime : data[6],
			f_prime : data[7],
			a_prime : data[8],
			l       : data[9],
			h       : data[10],
			e       : data[11],
			d       : data[12],
			c       : data[13],
			b       : data[14],
			iy      : data[15] | (data[16]<<8),
			ix      : data[17] | (data[18]<<8),
			iff2    : (data[19] & 0x04) !== 0 ? 1 : 0,
			iff1    : (data[19] & 0x02) !== 0 ? 1 : 0,
			r       : data[20],
			f       : data[21],
			a       : data[22],
			sp      : data[23] | (data[24]<<8),
			imode   : data[25],
			pc      : data[26] | (data[27]<<8)
		});
	}
}
