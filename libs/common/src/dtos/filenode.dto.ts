import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { FileNodeType } from '../enums/filenodetype.enum';

export class FileNode {
  @IsString()
  name!: string;

  @IsEnum(FileNodeType)
  type!: FileNodeType;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FileNode)
  children?: FileNode[];

  @IsOptional()
  expanded?: boolean;

  constructor(init?: Partial<FileNode>) {
    Object.assign(this, init);
  }
}
