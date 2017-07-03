/**
 * Interface to describe the memory processor bus
 */
export interface Memory {
	/**
	 * Read a byte from memory
	 *
	 * @param {number} address The address to read from
	 * @return The byte read
	 */
	readByte(address: number): number;

	/**
	 * Read a 16 bit word from memory, LSB, MSB order
	 *
	 * @param {number} address The address to read from
	 * @return The word read
	 */
	readWord(address: number): number;

	/**
	 * Write a byte into memory
	 *
	 * @param {number} address The address to be written to
	 * @param {number} data The byte to be written
	 */
	writeByte(address: number, data: number);

	/**
	 * Write a 16 bit word into memory, LSB, MSB order.
	 *
	 * @param {number} address The address to be written to
	 * @param {number} data The word to be written
	 */
	writeWord(address: number, data: number);
}

/**
 * Interface to describe the I/O processor bus
 */
export interface IO {
	/**
	 * Read data from an I/O port
	 *
	 * @param address The port to be read from
	 * @return The 8 bit value at the request port address
	 */
	read(address: number): number;

	/**
	 * Write data to an I/O port
	 *
	 * @param address The port to be written to
	 * @param data The 8 bit value to be written
	 */
	write(address: number, data: number);
}

/**
 * Interface to the processor
 */
export interface CPU {
	/**
	 * Reset the processor to a known state. Equivalent to a hardware reset.
	 *
	 * @param address the next address to execute after reset
	 */
	reset(address : number);

	/**
	 * ??
	 */
	executeInstruction();
}

