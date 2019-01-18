'use strict';
export default class CentronicsSystem {
    set device(device) {
        this._device = device;
    }
    readByte(address) {
        return this._device ? this._device.readByte() : 0xff;
    }
    writeByte(address, data) {
        if (this._device)
            this._device.writeByte(data);
    }
}
