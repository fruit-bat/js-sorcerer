import ExidySorcerer from './ExidySorcerer'
import ExidyFile from './ExidyFile'
import ExidyFileBinaryAjax from './ExidyFileBinaryAjax'
import BrowserKeyboard from './ExidyBrowserKeyboard';
import ElementPrinter from './ExidyElementPrinter';

const screenContainer = <HTMLDivElement>document.getElementById('exidy-screen-container');
const printerPaper = <HTMLElement>document.getElementById('exidyPaper');

const exidyFile : ExidyFile = new ExidyFileBinaryAjax();
const keyboard = new BrowserKeyboard();

const exidySorcerer = new ExidySorcerer(
	exidyFile,
	keyboard);

screenContainer.appendChild(exidySorcerer.screenCanvas);

//exidySorcerer.load('galx.snp');
//exidySorcerer.loadRomPack('Exidy Standard Basic Ver 1.0 (1978).ROM');
//exidySorcerer.loadRomPack('Exidy Z80 Development Pac (1979).ROM');
//exidySorcerer.loadRomPack('Exidy Word Processor Pac (1979).ROM');
//exidySorcerer.loadDisk(0, 'disk1.dsk');
//exidySorcerer.loadDisk(1, 'disk2.dsk');
//exidySorcerer.loadDisk(2, 'disk3.dsk');
//exidySorcerer.loadDisk(3, 'disk4.dsk');
//exidySorcerer.loadTape(0, 'chomp.tape');

screenContainer.addEventListener('keydown', (key) => {
	keyboard.browserKeyDown(key.keyCode);
	key.stopPropagation();
	key.preventDefault();
});

screenContainer.addEventListener('keyup', (key) => {
	keyboard.browserKeyUp(key.keyCode);
	key.stopPropagation();
	key.preventDefault();
});

const printer = new ElementPrinter(printerPaper);

//exidySorcerer.centronics = printer;

exidySorcerer.run();
