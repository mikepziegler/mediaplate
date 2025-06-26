import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { FileNode } from '@mediaplate/common';


@Injectable()
export class FileService {

  private http: HttpClient = inject(HttpClient)

  getAllFiles(): Observable<FileNode[]> {
    return this.http.get<FileNode[]>(environment.apiUrl + '/files');
  }

  uploadFile(files: File[]): Observable<{ path: string }> {

    const formData = new FormData();
    for (const file of files) {
      const relativePath =
        (file as any).webkitRelativePath ||
        (file as any).relativePath ||
        file.name;

      formData.append('files', file, relativePath);
    }

    console.log(formData)

    return this.http.post<{ path: string }>(`${environment.apiUrl}/files/upload`, formData);
  }

  deleteFile() {
    // TODO: Add deleteFile function
  }
}
