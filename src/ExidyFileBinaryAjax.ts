import ExidyFile from './ExidyFile'
import BinaryAjax from './BinaryAjax'

export default class ExidyFileBinaryAjax implements ExidyFile {
	public read(url: string) : Promise<Uint8Array> {
		return BinaryAjax.read(url).then((data) => {
			console.log('Read ' + url);
			return data;
		});
	}
}
