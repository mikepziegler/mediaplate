import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-filedrop-overlay',
  template: `
    <div
      class="absolute inset-0 z-50 pointer-events-none transition-opacity duration-200"
      [class.opacity-100]="isDragging"
      [class.opacity-0]="!isDragging"
      [class.bg-black]="isDragging"
      [class.bg-opacity-30]="isDragging"
    >
      <div
        class="w-full h-full flex items-center justify-center pointer-events-auto"
        (dragenter)="onDragEnter($event)"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <div class="text-white text-2xl border-2 border-white p-4 rounded">
          Drop files here
        </div>
      </div>
    </div>
  `,
})
export class FileDropOverlayComponent {
  @Output() fileDropped = new EventEmitter<FileList>();
  @Output() dragStateChange = new EventEmitter<boolean>();

  isDragging = false;

  onDragEnter(event: DragEvent) {
    if (this.containsFiles(event)) {
      this.isDragging = true;
      this.dragStateChange.emit(true);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault(); // needed to allow dropping
  }

  onDragLeave(event: DragEvent) {
    this.isDragging = false;
    this.dragStateChange.emit(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    this.dragStateChange.emit(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileDropped.emit(files);
    }
  }

  private containsFiles(event: DragEvent): boolean {
    const types = event.dataTransfer?.types;
    return types ? Array.from(types).includes('Files') : false;
  }
}
