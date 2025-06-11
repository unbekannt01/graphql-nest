import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadFile {
  @Field(() => Int)
  id: number;

  @Field()
  filename: string;

  @Field()
  url: string;

  @Field(() => Int)
  userId: number;
}
