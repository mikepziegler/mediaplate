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
        (change)="onFileChange($event)"
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

      @if (accept && !disabled) {
        <p class="text-xs text-gray-400 mt-2">
          Accepted: {{ accept }}
        </p>
      }

      @if (errorFiles.length > 0) {
        <div class="mt-4 text-sm text-red-500">
          <p>Some files were rejected:</p>
          <ul class="list-disc list-inside">
            @for (file of errorFiles; let i = $index; track i) {
              <li>{{ file }}</li>
            }
          </ul>
        </div>
      }


    </div>
  `,
  host: {
    class: 'block w-full', // This ensures the <ui-file-dropzone> tag fills width
  },
})
export class FileDropzoneComponent {
  @Input() accept = ''; // Defaults to all files if not provided
  @Input() disabled = false;
  @Output() filesSelected = new EventEmitter<FileList | null>();

  isDragging = false;
  errorFiles: string[] = [];

  @HostListener('dragover', ['$event'])
  onDragOver(evt: DragEvent) {
    if (this.disabled) return;
    evt.preventDefault();
    this.isDragging = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(evt: DragEvent) {
    if (this.disabled) return;
    evt.preventDefault();
    this.isDragging = false;
  }

  @HostListener('drop', ['$event'])
  onDrop(evt: DragEvent) {
    if (this.disabled) return;
    evt.preventDefault();
    this.isDragging = false;

    if (evt.dataTransfer?.files.length) {
      this.handleFileList(evt.dataTransfer.files);
    }
  }

  onFileChange(event: Event) {
    if (this.disabled) return;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFileList(input.files);
    }
  }

  triggerFileInput(fileInput: HTMLInputElement) {
    if (!this.disabled) {
      fileInput.click();
    }
  }

  private handleFileList(fileList: FileList) {
    const accepted = this.filterAcceptedFiles(fileList);
    const rejected = this.getRejectedFileNames(fileList, accepted);
    this.errorFiles = rejected;

    if (accepted.length > 0) {
      const finalList = this.toFileList(accepted);
      this.filesSelected.emit(finalList);
    } else {
      this.filesSelected.emit(null);
    }
  }

  private filterAcceptedFiles(files: FileList): File[] {
    if (!this.accept || this.accept.trim() === '') return Array.from(files); // default: accept all

    const acceptedTypes = this.accept.split(',').map((t) => t.trim());
    return Array.from(files).filter((file) => {
      return acceptedTypes.some((type) => {
        if (type === '*/*') return true;
        if (type.endsWith('/*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType + '/');
        }
        return file.type === type || file.name.endsWith(type);
      });
    });
  }

  private getRejectedFileNames(all: FileList, accepted: File[]): string[] {
    const acceptedNames = new Set(accepted.map((f) => f.name));
    return Array.from(all)
      .filter((file) => !acceptedNames.has(file.name))
      .map((file) => file.name);
  }

  private toFileList(files: File[]): FileList {
    const dataTransfer = new DataTransfer();
    files.forEach((f) => dataTransfer.items.add(f));
    return dataTransfer.files;
  }
}
