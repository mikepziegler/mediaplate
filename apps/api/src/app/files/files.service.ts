// files.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

@Injectable()
export class FilesService {
  private readonly storagePath = process.env.LOCAL_STORAGE_PATH || './uploads';

  constructor() {
    // Ensure the folder exists
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async getAllFilenames() {

    console.log(`Getting all filenames from ${this.storagePath}`);

    try {
      return fs.readdirSync(this.storagePath);
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }

  }

  getFilePath(filename: string): string {
    return path.join(this.storagePath, filename);
  }

  saveFile(file: Express.Multer.File): string {
    console.log(file);

    const filePath = path.join(this.storagePath, file.originalname);

    try {
      writeFileSync(filePath, file.buffer);
      return filePath;
    } catch (error: any) {
      throw new InternalServerErrorException('Failed to save file.');
    }
  }
}
