'use strict';
import { SECTORS_PER_TRACK, BYTES_PER_SECTOR } from './ExidyDiskConsts';
export default class ExidyArrayDisk {
    constructor(data) {
        this._data = data;
    }
    toIndex(track, sector, offset) {
        return (sector * BYTES_PER_SECTOR) + (track * SECTORS_PER_TRACK * BYTES_PER_SECTOR) + offset;
    }
    read(track, sector, offset) {
        return this._data[this.toIndex(track, sector, offset)];
    }
    write(track, sector, offset, data) {
        this._data[this.toIndex(track, sector, offset)] = data;
    }
}
