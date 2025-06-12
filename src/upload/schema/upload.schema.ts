/* eslint-disable prettier/prettier */
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadFile {
  @Field(() => Int)
  id: number;

  @Field()
  file: string;

  @Field()
  Creation: Date;
}
