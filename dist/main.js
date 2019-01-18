import ExidySorcerer from './ExidySorcerer';
import ExidyFileBinaryAjax from './ExidyFileBinaryAjax';
import BrowserKeyboard from './ExidyBrowserKeyboard';
import ElementPrinter from './ExidyElementPrinter';
const screenContainer = document.getElementById('exidy-screen-container');
const printerPaper = document.getElementById('exidyPaper');
const exidyFile = new ExidyFileBinaryAjax();
const exidySorcerer = new ExidySorcerer(exidyFile);
const keyboard = new BrowserKeyboard(exidySorcerer.keyboard);
screenContainer.appendChild(exidySorcerer.screenCanvas);
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
exidySorcerer.run();
