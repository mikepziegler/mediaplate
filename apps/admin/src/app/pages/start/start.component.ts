import { Component, inject, OnInit } from '@angular/core';
import { FileService } from './file.service';
import { AppLayoutComponent, FileDropzoneComponent } from '@ui';

@Component({
  selector: 'app-start',
  template: `
    <ui-app-layout>
      <div>
        <div class="p-6 flex flex-col gap-4">
          <div class="flex w-full">
            <ui-file-dropzone (filesSelected)="handleFiles($event)" />
          </div>
          <div>
            <h1>Files</h1>
            <div class="flex flex-col divide-y">
              @for (file of files; let i = $index; track i) {
              <div class="py-4 flex gap-4">
                <div class="mr-auto">
                  <span>{{ file }}</span>
                </div>
                <div>
                  <span>View</span>
                </div>
                <div>
                  <span>Delete</span>
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
    </ui-app-layout>
  `,
  providers: [FileService],
  imports: [AppLayoutComponent, FileDropzoneComponent],
})
export class StartComponent implements OnInit {
  files: string[] = [];
  private fileService = inject(FileService);

  ngOnInit() {
    this.fileService.getAllFiles().subscribe((files) => {
      this.files = files;
    });
  }

  handleFiles(files: FileList | null) {
    if (!files) return; // TODO: Error handling

    this.fileService.uploadFile(files)
      .subscribe({
        next: (res: any) => console.log('Upload successful:', res),
        error: (err: any) => console.error('Upload failed:', err),
        complete: () => {
          this.ngOnInit();
        },
      });
  }
}
