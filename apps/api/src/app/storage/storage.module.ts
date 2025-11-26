import { Module } from '@nestjs/common';
import { ObjectStorageService } from './object-storage.service';


@Module({
    providers: [ObjectStorageService],
    exports: [ObjectStorageService], // ⬅ so other modules can inject it
})
export class StorageModule {}
