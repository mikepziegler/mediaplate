// src/gallery/gallery.controller.ts
import {
    Controller,
    Get,
    Param,
    Post,
    Delete,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';
import { GalleryItemInteface, GallerySummaryInterface} from '@mediaplate/util';

@Controller()
export class GalleryController {
    constructor(private readonly galleryService: GalleryService) {}

    // ----- GALLERIES -----

    @Get('galleries')
    async listGalleries(): Promise<GallerySummaryInterface[]> {
        return this.galleryService.listGalleries();
    }

    // ----- IMAGES -----

    @Get('galleries/:gallery/images')
    async listImages(
        @Param('gallery') galleryName: string,
    ): Promise<GalleryItemInteface[]> {
        return this.galleryService.listImagesInGallery(galleryName);
    }

    @Post('galleries/:gallery/images')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
        @Param('gallery') galleryName: string,
        @UploadedFile() file: Express.Multer.File,
    ): Promise<GalleryItemInteface> {
        return this.galleryService.uploadImageToGallery(galleryName, file);
    }

    /**
     * Delete an image by its storage key.
     * The frontend should send the `id` (full key) back, URL-encoded.
     *
     * Example:
     *   DELETE /images/cats%2Fbc939f1a-...-fluffy.png
     */
    @Delete('images/:objectKey')
    async deleteImage(@Param('objectKey') objectKeyEncoded: string): Promise<void> {
        const objectKey = decodeURIComponent(objectKeyEncoded);
        await this.galleryService.deleteImageByKey(objectKey);
    }

    @Get('images/:objectKey/url')
    async getImageUrl(@Param('objectKey') objectKeyEncoded: string) {
        const objectKey = decodeURIComponent(objectKeyEncoded);
        const url = await this.galleryService.getImageUrl(objectKey);

        return {
            key: objectKey,
            url,
        };
    }
}
