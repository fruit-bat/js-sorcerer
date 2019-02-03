'use strict';
export default class ExidyMonostable {
    constructor(periodMillis, listener) {
        this._activate = false;
        this._interval = null;
        this._periodMillis = periodMillis;
        this._listener = listener;
    }
    activate() {
        if (this._interval) {
            this._activate = true;
        }
        else {
            this._activate = false;
            this._listener(true);
            this._interval = setInterval(() => {
                if (this._activate) {
                    this._activate = false;
                }
                else {
                    clearInterval(this._interval);
                    this._interval = null;
                    this._listener(false);
                }
            }, this._periodMillis);
        }
    }
}
