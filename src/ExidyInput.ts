"use strict"

/**
 * Interface to input
 */
export default interface Input {
	/**
	 * Read a byte from input
	 *
	 * @param {number} address The address to read from
	 * @return The byte read
	 */
	readByte(address: number): number;
}
