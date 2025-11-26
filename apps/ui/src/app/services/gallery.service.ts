import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GallerySummaryInterface, GalleryItemInteface } from '@mediaplate/util'

@Injectable({ providedIn: 'root' })
export class GalleryService {
    private http = inject(HttpClient);

    // TODO: move this to environment.ts if you like
    private readonly apiBaseUrl = 'http://localhost:3000';

    getGalleries(): Observable<GallerySummaryInterface[]> {
        return this.http.get<GallerySummaryInterface[]>(`${this.apiBaseUrl}/galleries`);
    }

    getImages(galleryName: string): Observable<GalleryItemInteface[]> {
        return this.http.get<GalleryItemInteface[]>(
            `${this.apiBaseUrl}/galleries/${encodeURIComponent(galleryName)}/images`,
        );
    }

    uploadImage(galleryName: string, file: File): Observable<GalleryItemInteface> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<GalleryItemInteface>(
            `${this.apiBaseUrl}/galleries/${encodeURIComponent(galleryName)}/images`,
            formData,
        );
    }

    deleteImage(image: GalleryItemInteface) {
        // backend expects full key in the URL, so we send image.id
        const encodedKey = encodeURIComponent(image.id);
        return this.http.delete<void>(`${this.apiBaseUrl}/images/${encodedKey}`);
    }
}
