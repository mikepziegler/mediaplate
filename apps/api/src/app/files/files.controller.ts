import {
  Controller, Get, NotFoundException, Param,
  Post, Res, UploadedFiles, UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import * as fs from 'node:fs';
import * as multer from 'multer';

const memoryStorage = multer.memoryStorage();

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getAllFilenames() {
    return await this.filesService.getAllFilenames()
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string) {
    const filePath = this.filesService.getFilePath(filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

  }

  @UseInterceptors(FilesInterceptor('files', 100, {
    storage: memoryStorage,
    preservePath: true,
  }))
  @Post('upload')
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(files.map(f => f.originalname));
    const savedPaths = files.map((file) => this.filesService.saveFile(file));
    return { paths: savedPaths };
  }

}
