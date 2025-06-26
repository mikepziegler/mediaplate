import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import { buildFileTree, FileNode } from '@mediaplate/common';

@Injectable()
export class FilesService {
  private readonly storagePath = process.env.LOCAL_STORAGE_PATH || './uploads';

  constructor() {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async getAllFilenames(): Promise<FileNode[]> {
    const filenames: string[] = [];

    const walk = (dir: string, relativeRoot = '') => {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relativePath = path.join(relativeRoot, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath, relativePath);
        } else {
          filenames.push(relativePath.replace(/\\/g, '/'));
        }
      }
    };

    try {
      walk(this.storagePath);
      return buildFileTree(filenames);
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  getFilePath(filename: string): string {
    return path.join(this.storagePath, filename);
  }

  saveFile(file: Express.Multer.File): string {
    const normalizedPath = file.originalname.replace(/\\/g, '/');
    const targetPath = path.join(this.storagePath, normalizedPath);

    const dir = path.dirname(targetPath);
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(targetPath, file.buffer);
    return targetPath;
  }
}
