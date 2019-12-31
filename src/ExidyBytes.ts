'use strict';

export default class ExidyBytes {

    public static set2lm(data: Uint8Array, address: number, value: number): void {
        data[address] = value & 0xff;
        data[address + 1] = (value >>> 8) & 0xff;
    }

    public static set2ml(data: Uint8Array, address: number, value: number): void {
        data[address + 1] = value & 0xff;
        data[address] = (value >>> 8) & 0xff;
    }

    public static set4lm(data: Uint8Array, address: number, value: number): void {
        data[address] = value & 0xff;
        data[address + 1] = (value >>> 8) & 0xff;
        data[address + 2] = (value >>> 16) & 0xff;
        data[address + 3] = (value >>> 24) & 0xff;
    }

    public static set4ml(data: Uint8Array, address: number, value: number): void {
        data[address + 3] = value & 0xff;
        data[address + 2] = (value >>> 8) & 0xff;
        data[address + 1] = (value >>> 16) & 0xff;
        data[address] = (value >>> 24) & 0xff;
    }

    public static get2lm(data: Uint8Array, address: number): number {
        return data[address] +
            (data[address + 1] << 8);
    }

    public static get2ml(data: Uint8Array, address: number): number {
        return data[address + 1] +
            (data[address] << 8);
    }

    public static get4lm(data: Uint8Array, address: number): number {
        return data[address] +
            (data[address + 1] << 8) +
            (data[address + 2] << 16) +
            (data[address + 3] << 24);
    }

    public static get4ml(data: Uint8Array, address: number): number {
        return data[address + 3] +
            (data[address + 2] << 8) +
            (data[address + 1] << 16) +
            (data[address] << 24);
    }
}
