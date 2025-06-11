// update.args.ts
import { InputType, Field, Int, PartialType, OmitType } from '@nestjs/graphql';
import { UploadFileArgs } from './upload.args';

@InputType()
export class UpdateFileArgs extends PartialType(
  OmitType(UploadFileArgs, ['id'] as const),
) {
  @Field(() => Int)
  id: number;
}
