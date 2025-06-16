/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { UploadFile } from './entities/upload.entity';
import { FileUpload } from 'graphql-upload-minimal';
import { SuperBaseService } from './supabase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateFileArgs } from './args/update-file.args';

@Injectable()
export class UploadFileService {
  public readonly uploadRepo: Repository<UploadFile>;
  private readonly supabaseService: SuperBaseService;

  constructor(
    @InjectRepository(UploadFile)
    uploadRepo: Repository<UploadFile>,
    supabaseService: SuperBaseService,
  ) {
    this.uploadRepo = uploadRepo;
    this.supabaseService = supabaseService;
  }

  async uploadFile(file: FileUpload, userId?: number): Promise<string> {
    const {
      filename,
      mimetype,
      createReadStream,
    }: {
      filename: string;
      mimetype: string;
      createReadStream: (this: void) => NodeJS.ReadableStream;
    } = file;

    const buffer =
      await this.supabaseService.streamToBuffer(createReadStream());
    const publicUrl = await this.supabaseService.uploadBuffer(
      filename,
      buffer,
      mimetype,
    );

    // Check if file already exists for this user
    const alreadyExists = await this.uploadRepo.findOne({
      where: { file: publicUrl, user: { id: userId } },
    });

    if (alreadyExists) {
      throw new UnauthorizedException(
        'File Already Used or Uploaded in Database...!',
      );
    }

    // Create the upload file entity with proper user relation
    const uploadFile = this.uploadRepo.create({
      file: publicUrl,
      Creation: new Date(),
    });

    // If userId is provided, set the user relation properly
    if (userId) {
      (uploadFile as any).user = { id: userId };
    }

    await this.uploadRepo.save(uploadFile);
    return `File uploaded successfully: ${publicUrl}`;
  }

  async findUserFile(userId: number): Promise<UploadFile[]> {
    return this.uploadRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async findUserAllFile(): Promise<UploadFile[]> {
    return this.uploadRepo.find();
  }

  async deleteFile(id: number, userId: number): Promise<string> {
    const file = await this.uploadRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!file) {
      throw new HttpException(
        'File not found or you do not have permission to delete it.',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.supabaseService.deleteFile(file.file);

    await this.uploadRepo.delete(id);
    return 'File has been deleted...!';
  }

  async updateFile(
    updateFileArgs: UpdateFileArgs & { file: FileUpload },
    userId: number,
  ): Promise<string> {
    const { id, file } = updateFileArgs;
    const { filename, mimetype, createReadStream } = file;

    const record = await this.uploadRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['user'],
    });

    if (!record) {
      throw new HttpException('File not found.', HttpStatus.NOT_FOUND);
    }

    const buffer =
      await this.supabaseService.streamToBuffer(createReadStream());
    const publicUrl = await this.supabaseService.uploadBuffer(
      filename,
      buffer,
      mimetype,
    );

    await this.uploadRepo.update(
      { id, user: { id: userId } },
      {
        file: publicUrl,
        Updation: new Date(),
      },
    );

    return 'File updated successfully.';
  }
}
