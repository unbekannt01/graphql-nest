import { Field, InputType, Int } from '@nestjs/graphql';
import { GraphQLUpload, FileUpload } from 'graphql-upload-minimal';

@InputType()
export class UploadFileArgs {
  @Field(() => Int)
  id: number;

  @Field(() => GraphQLUpload)
  file: FileUpload;
}
