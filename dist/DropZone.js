'use strict';
export default class DropZone {
    stopEvent(e) {
        e.stopPropagation();
        e.preventDefault();
    }
    handleDragOver(e) {
        this.stopEvent(e);
    }
    handleDragEnter(e) {
        this.stopEvent(e);
    }
    handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let reader = new FileReader();
            reader.onload = (e) => {
                this.handler(reader.result);
            };
            reader.readAsArrayBuffer(file);
        }
    }
    handleDrop(e) {
        this.stopEvent(e);
        const url = e.dataTransfer.getData('text/plain');
        if (url) {
            console.log('TODO drop url');
        }
        else {
            this.handleFiles(e.dataTransfer.files);
        }
    }
    constructor(element, handler) {
        this.handler = handler;
        this.element = element;
        this.element.addEventListener('dragenter', (e) => { this.handleDragEnter(e); }, false);
        this.element.addEventListener('dragover', (e) => { this.handleDragOver(e); }, false);
        this.element.addEventListener('drop', (e) => { this.handleDrop(e); }, false);
    }
}
