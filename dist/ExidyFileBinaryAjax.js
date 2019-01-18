'use scrict';
import BinaryAjax from './BinaryAjax';
export default class ExidyFileBinaryAjax {
    read(url) {
        return BinaryAjax.read(url).then((data) => {
            console.log('Read ' + url);
            return data;
        });
    }
}
