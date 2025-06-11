/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { createWriteStream } from 'fs';
import { FileUpload } from 'graphql-upload-minimal';
import { join } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { UploadFile } from './entities/upload.entity';
import { UpdateFileArgs } from './args/update-file.args';

@Injectable()
export class UploadFileService {
  constructor(
    @InjectRepository(UploadFile)
    public readonly uploadRepo: Repository<UploadFile>,
  ) {}

  async uploadFile(file: FileUpload, userId?: number): Promise<string> {
    const { filename } = file;
    const createReadStream: () => NodeJS.ReadableStream =
      file.createReadStream.bind(file);
    const uploadPath = join(process.cwd(), './uploads', filename);
    const stream = createReadStream();

    if (file) {
      throw new UnauthorizedException(
        'File Already Used or Uploaded in Database...!',
      );
    }

    // Save file to disk
    await new Promise<void>((resolve, reject) =>
      stream
        .pipe(createWriteStream(uploadPath))
        .on('finish', () => resolve())
        .on('error', (error) => reject(error)),
    );

    // Save metadata to database if userId is provided
    if (userId) {
      const uploadFile = { file: filename, user: { id: userId } };
      await this.uploadRepo.save(uploadFile);
    }

    return `File uploaded successfully: ${filename}`;
  }

  async findUserFile(userId: number): Promise<UploadFile[]> {
    const file = await this.uploadRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    return file;
  }

  async deleteFile(id: number, userId: number) {
    const file = await this.uploadRepo.findOne({
      where: { id: id, user: { id: userId } },
    });

    if (!file) {
      throw new HttpException(
        'File not found or you do not have to permission to delete it.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.uploadRepo.delete(id);
    return 'File has been deleted...!';
  }

  async updateFile(
    updateFileArgs: UpdateFileArgs & { file: FileUpload },
    userId: number,
  ): Promise<string> {
    await this.uploadRepo.findOne({
      where: { id: updateFileArgs.id, user: { id: userId } },
      relations: ['user'],
    });

    const { filename } = updateFileArgs.file;

    await this.uploadRepo.update(
      { id: updateFileArgs.id, user: { id: userId } },
      {
        file: filename,
        Updation: new Date(),
      },
    );

    return 'File updated successfully.';
  }
}
