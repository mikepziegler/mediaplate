import { Component, inject, OnInit } from '@angular/core';
import { FileService } from './file.service';

@Component({
  selector: 'app-start',
  template: `
    <input type="file" (change)="onFileSelected($event)" multiple accept="*" />
  `,
  providers: [FileService],
})
export class StartComponent implements OnInit {
  private fileService = inject(FileService);

  ngOnInit() {

    this.fileService.getAllFiles().subscribe(files => {

      console.log(files);
    })

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    this.fileService.uploadFile(input.files).subscribe({
      next: (res: any) => console.log('Upload successful:', res),
      error: (err: any) => console.error('Upload failed:', err),
    });
  }
}
