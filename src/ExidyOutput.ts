"use strict"

/**
 * Interface to output
 */
export default interface Output {
	/**
	 * Write a byte to output
	 *
	 * @param {number} address The address to be written to
	 * @param {number} data The byte to be written
	 */
	writeByte(address: number, data: number) : void;
}
