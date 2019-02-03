'use strict';

export default class ExidyMonostable {

    private _periodMillis: Number;
    private _activate: Boolean = false;
    private _listener: (running: boolean) => void;
    private _interval: any = null;

    public constructor(periodMillis: number, listener: (running: boolean) => void) {
        this._periodMillis = periodMillis;
        this._listener = listener;
    }

    public activate(): void {
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
