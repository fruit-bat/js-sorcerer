"use strict"

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

