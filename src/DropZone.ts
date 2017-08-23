'use strict';

export default class DropZone {

    private element: HTMLElement;
    private handler: (buffer: ArrayBuffer) => void;

    private stopEvent(e: Event) {
        e.stopPropagation();
        e.preventDefault();
    }

    private handleDragOver(e: Event) {
        this.stopEvent(e);
    }

    private handleDragEnter(e: Event) {
        this.stopEvent(e);
    }

    private handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            let file = files[i];
            let reader = new FileReader();
            reader.onload = (e) => {
                this.handler(reader.result);
            };
            reader.readAsArrayBuffer(file);
        }
    }

    private handleDrop(e: DragEvent) {
        this.stopEvent(e);

        const url = e.dataTransfer.getData('text/plain');

        if (url) {
            console.log('TODO drop url');
        } else {
            this.handleFiles(e.dataTransfer.files);
        }
    }

    public constructor(
        element: HTMLElement,
        handler: (buffer: ArrayBuffer) => void ) {
        
        this.handler = handler;
        this.element = element;
        this.element.addEventListener('dragenter', (e) => { this.handleDragEnter(e); }, false);
        this.element.addEventListener('dragover', (e) => { this.handleDragOver(e); }, false);
        this.element.addEventListener('drop', (e) => { this.handleDrop(e); }, false);
    }
}
