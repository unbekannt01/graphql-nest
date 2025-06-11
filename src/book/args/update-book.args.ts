import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { AddBookArgs } from './add-book.args';

@InputType()
export class UpdateBookArgs extends PartialType(
  OmitType(AddBookArgs, ['id'] as const),
) {
  @Field(() => Int)
  id: number;
}
