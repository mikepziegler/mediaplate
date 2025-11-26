import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';


@Module({
    imports: [StorageModule],            // ⬅ gives access to ObjectStorageService
    controllers: [GalleryController],
    providers: [GalleryService],
})
export class GalleryModule {}
