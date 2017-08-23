'use strict';

export default class BinaryAjax {

    public static read(url: string): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {

            let xmlHTTP = new XMLHttpRequest();

            xmlHTTP.open('GET', url, true);

            // Must include this line - specifies the response type we want
            xmlHTTP.responseType = 'arraybuffer';

            xmlHTTP.onload = function(e) {
                resolve(new Uint8Array(xmlHTTP.response));
            };

            xmlHTTP.send();
        });
    }
}

