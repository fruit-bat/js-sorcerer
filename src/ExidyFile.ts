"use strict"

export default interface ExidyFile {
	read(url: string) : Promise<Uint8Array>;
}
