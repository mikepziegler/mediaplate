import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'ui-file-drop-overlay',
  templateUrl: './file-drop-overlay.component.html',
})
export class FileDropOverlayComponent {
  isDragging = false;

  @HostListener('window:dragenter', ['$event'])
  onWindowDragEnter(event: DragEvent) {
    this.isDragging = true;
  }

  @HostListener('window:dragleave', ['$event'])
  onWindowDragLeave(event: DragEvent) {
    this.isDragging = false;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      console.log('Dropped files:', files);
      // Handle your files here
    }
  }
}
