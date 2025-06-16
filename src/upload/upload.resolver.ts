/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Mutation, Resolver, Context, Args, Query, Int } from '@nestjs/graphql';
import { UploadFileService } from './upload.service';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UploadFile } from './schema/upload.schema';

@Resolver()
export class UploadFileResolver {
  constructor(private readonly uploadFileService: UploadFileService) {}

  @Mutation(() => String)
  @UseGuards(JwtGuard)
  async uploadFile(
    @Args('file', { type: () => GraphQLUpload }) fileUploadInput: FileUpload,
    @Context() context: any,
  ): Promise<string> {
    const userId = context.user?.userId || context.user?.id;
    return this.uploadFileService.uploadFile(fileUploadInput, userId);
  }

  @Query(() => [UploadFile], { name: 'myFiles' })
  @UseGuards(JwtGuard)
  getMyFiles(@Context() context: any) {
    const file = context.user || context.req.user;
    return this.uploadFileService.findUserFile(file.id);
  }

  @Query(() => [UploadFile], { name: 'onlyFiles' })
  async getAllUserFiles(): Promise<UploadFile[]> {
    const files = await this.uploadFileService.findUserAllFile();
    // Ensure Creation is always a Date (never null)
    return files
      .filter((file: any) => file.Creation !== null)
      .map((file: any) => ({
        ...file,
        Creation: file.Creation as Date,
      }));
  }

  @Mutation(() => String, { name: 'deleteFile' })
  @UseGuards(JwtGuard)
  deleteFileById(
    @Args({ name: 'fileId', type: () => Int }) id: number,
    @Context() context: any,
  ) {
    const file = context.user || context.req.user;
    return this.uploadFileService.deleteFile(id, file.id);
  }

  @Mutation(() => String, { name: 'updateFile' })
  @UseGuards(JwtGuard)
  async updateFile(
    @Args('id', { type: () => Int }) id: number,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @Context() context: any,
  ): Promise<string> {
    const user = context.user || context.req.user;

    const result = await this.uploadFileService.updateFile(
      { id, file },
      user.id,
    );

    return result;
  }
}
