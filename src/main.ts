import ExidySorcerer from './ExidySorcerer'
import ExidyFile from './ExidyFile'
import ExidyFileBinaryAjax from './ExidyFileBinaryAjax'
import BrowserKeyboard from './ExidyBrowserKeyboard';

let screenCanvas = <HTMLCanvasElement>document.getElementById('exidyScreen');
let exidyFile : ExidyFile = new ExidyFileBinaryAjax();
let keyboard = new BrowserKeyboard();

let exidySorcerer = new ExidySorcerer(
	exidyFile,
	keyboard,
	<HTMLCanvasElement>document.getElementById('exidyBytes'),
	<HTMLCanvasElement>document.getElementById('exidyCharacters'),
	screenCanvas);
//exidySorcerer.load('galx.snp');

screenCanvas.addEventListener('keydown', (key) => {
	keyboard.browserKeyDown(key.keyCode);
	key.stopPropagation();
	key.preventDefault();
});

screenCanvas.addEventListener('keyup', (key) => {
	keyboard.browserKeyUp(key.keyCode);
	key.stopPropagation();
	key.preventDefault();
});

exidySorcerer.run();
