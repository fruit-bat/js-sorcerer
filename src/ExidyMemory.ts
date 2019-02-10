'use strict';


export const MEMORY_SIZE_IN_BYTES = 65536;
export const CHARS_START = 0xF800;
export const SCREEN_START = 0xF080;
export const SCREEN_WIDTH = 64;
export const SCREEN_HEIGHT = 30;
export const SCREEN_SIZE_BYTES = SCREEN_WIDTH * SCREEN_HEIGHT;
export const CHARS_SIZE_BYTES = 8 * 256;

/**
 * Interface to describe the memory processor bus
 */
export default interface Memory {
    /**
     * Read a byte from memory
     *
     * @param {number} address The address to read from
     * @return The byte read
     */
    readByte(address: number): number;

    /**
     * Write a byte into memory
     *
     * @param {number} address The address to be written to
     * @param {number} data The byte to be written
     */
    writeByte(address: number, data: number);
}

