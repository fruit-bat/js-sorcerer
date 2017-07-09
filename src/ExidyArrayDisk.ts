"use strict"

import ExidyDisk from './ExidyDisk'
import { SECTORS_PER_TRACK, NUMBER_OF_TRACKS, BYTES_PER_SECTOR } from './ExidyDisk'

export default class ExidyArrayDisk implements ExidyDisk {

	private _data : Uint8Array;

	public constructor(data : Uint8Array) {
		this._data = data;
	}

	private toIndex(track : number, sector : number, offset : number) : number {
		return (sector * BYTES_PER_SECTOR) + (track * SECTORS_PER_TRACK * BYTES_PER_SECTOR) + offset;
	}

	read(track : number, sector : number, offset : number) : number {
		return this._data[this.toIndex(track, sector, offset)];
	}

	write(track : number, sector : number, offset : number, data : number) : void {
		this._data[this.toIndex(track, sector, offset)] = data;

	}

	activate() : void {
	}

	deactivate() : void {
	}
}
