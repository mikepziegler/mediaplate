// files.controller.ts
import {
  Controller, Get, NotFoundException, Param,
  Post, Res,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getAllFilenames() {
    return await this.filesService.getAllFilenames()
  }

  @Get(':filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.filesService.getFilePath(filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    // res.sendFile(path.resolve(filePath));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File): { path: string } {
    console.log('files uploaded')
    const savedPath = this.filesService.saveFile(file);
    return { path: savedPath };
  }



}
