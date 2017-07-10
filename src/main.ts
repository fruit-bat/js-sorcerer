import ExidySorcerer from './ExidySorcerer'
import ExidyFile from './ExidyFile'
import ExidyFileBinaryAjax from './ExidyFileBinaryAjax'
import BrowserKeyboard from './ExidyBrowserKeyboard';
import ElementPrinter from './ExidyElementPrinter';

let screenCanvas = <HTMLCanvasElement>document.getElementById('exidyScreen');
let printerPaper = <HTMLElement>document.getElementById('exidyPaper');

let exidyFile : ExidyFile = new ExidyFileBinaryAjax();
let keyboard = new BrowserKeyboard();

let exidySorcerer = new ExidySorcerer(
	exidyFile,
	keyboard,
	<HTMLCanvasElement>document.getElementById('exidyBytes'),
	<HTMLCanvasElement>document.getElementById('exidyCharacters'),
	screenCanvas);

//exidySorcerer.load('galx.snp');
//exidySorcerer.loadRomPack('Exidy Standard Basic Ver 1.0 (1978).ROM');
//exidySorcerer.loadRomPack('Exidy Z80 Development Pac (1979).ROM');
//exidySorcerer.loadRomPack('Exidy Word Processor Pac (1979).ROM');
//exidySorcerer.loadDisk(0, 'disk1.dsk');
//exidySorcerer.loadDisk(1, 'disk2.dsk');
//exidySorcerer.loadDisk(2, 'disk3.dsk');
//exidySorcerer.loadDisk(3, 'disk4.dsk');
//exidySorcerer.loadTape(0, 'chomp.tape');

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

let printer = new ElementPrinter(printerPaper);

//exidySorcerer.centronics = printer;

exidySorcerer.run();
