'use strict';

export default interface ExidyDisk {

    read( track: number, sector: number, offset: number ): number;

    write( track: number, sector: number, offset: number, data: number ): void;
}

