// src/gallery/gallery.service.ts
import { Injectable } from '@nestjs/common';
import {
    ObjectStorageService
} from '../storage/object-storage.service';
import { randomUUID } from 'crypto';
import {
    GalleryItemInteface,
    GallerySummaryInterface,
    StorageObjectInterface,
} from '@mediaplate/util';

@Injectable()
export class GalleryService {
    constructor(private readonly storage: ObjectStorageService) {}

    async listGalleries(): Promise<GallerySummaryInterface[]> {
        return this.storage.listGalleries();
    }

    async getImageUrl(objectKey: string): Promise<string> {
        return this.storage.getPresignedUrl(objectKey);
    }

    async listImagesInGallery(galleryName: string): Promise<GalleryItemInteface[]> {
        const objects: StorageObjectInterface[] =
            await this.storage.listObjectsInGallery(galleryName);

        return objects.map((o) => {
            const fileName = o.name.split('/').slice(1).join('/') || o.name;

            return {
                id: o.name,              // full key
                gallery: galleryName,
                fileName,
                size: o.size,
                lastModified: o.lastModified,
                url: o.url,
            };
        });
    }

    async uploadImageToGallery(
        galleryName: string,
        file: Express.Multer.File,
    ): Promise<GalleryItemInteface> {
        const id = randomUUID();
        const key = `${galleryName}/${id}-${file.originalname}`;

        await this.storage.uploadObject(key, file.buffer, file.mimetype);
        const url = await this.storage.getPresignedUrl(key);

        return {
            id: key,
            gallery: galleryName,
            fileName: file.originalname,
            size: file.size,
            lastModified: new Date(),
            url,
        };
    }

    async deleteImageByKey(objectKey: string): Promise<void> {
        // objectKey is the full key (e.g. "cats/uuid-cat.png")
        await this.storage.removeObject(objectKey);
    }

}
