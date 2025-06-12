/* eslint-disable prettier/prettier */
import { Field, InputType } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal';

@InputType()
export class UploadFileArgs {
  @Field(() => GraphQLUpload)
  file: FileUpload;
}
