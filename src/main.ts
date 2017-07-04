import ExidySorcerer from './ExidySorcerer'
import ExidyFile from './ExidyFile'
import ExidyFileBinaryAjax from './ExidyFileBinaryAjax'

let exidyFile : ExidyFile = new ExidyFileBinaryAjax();
let exidySorcerer = new ExidySorcerer(
	exidyFile,
	<HTMLCanvasElement>document.getElementById('exidyBytes'),
	<HTMLCanvasElement>document.getElementById('exidyCharacters'),
	<HTMLCanvasElement>document.getElementById('exidyScreen'));
exidySorcerer.load('chomp.snp');
exidySorcerer.run();
