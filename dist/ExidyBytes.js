'use strict';
export default class ExidyBytes {
    static set2lm(data, address, value) {
        data[address] = value & 0xff;
        data[address + 1] = (value >>> 8) & 0xff;
    }
    static set2ml(data, address, value) {
        data[address + 1] = value & 0xff;
        data[address] = (value >>> 8) & 0xff;
    }
    static set4lm(data, address, value) {
        data[address] = value & 0xff;
        data[address + 1] = (value >>> 8) & 0xff;
        data[address + 2] = (value >>> 16) & 0xff;
        data[address + 3] = (value >>> 24) & 0xff;
    }
    static set4ml(data, address, value) {
        data[address + 3] = value & 0xff;
        data[address + 2] = (value >>> 8) & 0xff;
        data[address + 1] = (value >>> 16) & 0xff;
        data[address] = (value >>> 24) & 0xff;
    }
    static get2lm(data, address) {
        return data[address] +
            (data[address + 1] << 8);
    }
    static get2ml(data, address) {
        return data[address + 1] +
            (data[address] << 8);
    }
    static get4lm(data, address) {
        return data[address] +
            (data[address + 1] << 8) +
            (data[address + 2] << 16) +
            (data[address + 3] << 24);
    }
    static get4ml(data, address) {
        return data[address + 3] +
            (data[address + 2] << 8) +
            (data[address + 1] << 16) +
            (data[address] << 24);
    }
}
