import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ui-file-dropzone',
  imports: [NgClass],
  template: `
    <div
      class="w-full border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ease-in-out hover:border-blue-400 hover:bg-blue-50 group"
      [ngClass]="{
        'cursor-pointer': !disabled,
        'border-blue-500 bg-blue-50': isDragging && !disabled,
        'bg-gray-100 text-gray-400 cursor-not-allowed': disabled
      }"
      (click)="triggerFileInput(fileInput)"
    >
      <input
        type="file"
        class="hidden"
        #fileInput
        [attr.accept]="accept"
        webkitdirectory
        multiple
        [disabled]="disabled"
      />

      <p>
        <span
          [ngClass]="
            disabled
              ? 'text-gray-400'
              : 'text-blue-600 font-medium transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:text-blue-700'
          "
        >
          Click
        </span>
        or drag files to upload
      </p>
    </div>
  `,
  host: {
    class: 'block w-full'
  },
})
export class FileDropzoneComponent {
  @Input() accept = '';
  @Input() disabled = false;

  @Output() fileDropped = new EventEmitter<File[]>();
  @Output() dragStateChange = new EventEmitter<boolean>();

  isDragging = false;

  @HostListener('dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    if (this.disabled) return;
    evt.preventDefault();
    this.isDragging = true;
    this.dragStateChange.emit(true)
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt: DragEvent) {
    if (this.disabled) return;
    evt.preventDefault();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  async onDrop(event: DragEvent) {
    if (this.disabled) return;
    event.preventDefault();
    this.isDragging = false;
    this.dragStateChange.emit(false);

    const items = event.dataTransfer?.items;
    if (!items) return;

    const files: File[] = [];
    const promises: Promise<void>[] = [];

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry?.();
      if (entry) {
        promises.push(this.traverseFileTree(entry, '', files));
      }
    }

    await Promise.all(promises);

    const acceptedFiles = this.accept.length > 0
      ? files.filter(file => this.accept.includes(file.type))
      : files;

    if (acceptedFiles.length > 0) {
      this.fileDropped.emit(files);
    }
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    if (!this.disabled) {
      fileInput.click();
    }
  }

  private traverseFileTree(entry: any, path: string, files: File[]): Promise<void> {
    return new Promise((resolve) => {
      if (entry.isFile) {
        entry.file((file: File) => {
          (file as any).relativePath = path + file.name;
          files.push(file);
          resolve();
        });
      } else if (entry.isDirectory) {
        const dirReader = entry.createReader();
        dirReader.readEntries((entries: any[]) => {
          const subPromises = entries.map(e =>
            this.traverseFileTree(e, path + entry.name + '/', files),
          );
          Promise.all(subPromises).then(() => resolve());
        });
      } else {
        resolve();
      }
    });
  }
}
