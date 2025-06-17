import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-start',
  template: `
    <input
      type="file"
      (change)="onFileSelected($event)"
      multiple
      accept="*"
    />
  `
})
export class StartComponent {
  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;

    const formData = new FormData();
    for (const file of Array.from(input.files)) {
      formData.append('file', file); // Change to `files[]` if backend expects an array
    }

    this.http.post<{ path: string }>(`${environment.apiUrl}/files/upload`, formData).subscribe({
      next: (res: any) => console.log('Upload successful:', res),
      error: (err: any) => console.error('Upload failed:', err),
    });
  }
}
