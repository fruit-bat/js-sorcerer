'use strict';

export default interface ExidyDisk {

    read( track: number, sector: number, offset: number ): number;

    write( track: number, sector: number, offset: number, data: number ): void;

    activate(): void;

    deactivate(): void;
}

export const SECTORS_PER_TRACK = 16;
export const NUMBER_OF_TRACKS = 77;
export const BYTES_PER_SECTOR = 256 + 14;
