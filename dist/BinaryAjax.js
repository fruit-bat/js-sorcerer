'use strict';
export default class BinaryAjax {
    static read(url) {
        return new Promise((resolve, reject) => {
            let xmlHTTP = new XMLHttpRequest();
            xmlHTTP.open('GET', url, true);
            xmlHTTP.responseType = 'arraybuffer';
            xmlHTTP.onload = function (e) {
                resolve(new Uint8Array(xmlHTTP.response));
            };
            xmlHTTP.send();
        });
    }
}
