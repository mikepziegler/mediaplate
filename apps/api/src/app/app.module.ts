import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { GalleryModule } from './gallery/gallery.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }), // optional but recommended
      HealthModule,
      StorageModule,   // strictly not needed if only used inside GalleryModule,
      GalleryModule,   // but adding it is fine
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
