import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';


@Injectable()
export class FileService {

  private http: HttpClient = inject(HttpClient)

  getAllFiles(): Observable<any> {
    return this.http.get(environment.apiUrl + '/files');
  }

  uploadFile(files: FileList): Observable<{ path: string }> {
    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('file', file); // Change to `files[]` if backend expects an array
    }

    return this.http.post<{ path: string }>(`${environment.apiUrl}/files/upload`, formData);
  }
}
