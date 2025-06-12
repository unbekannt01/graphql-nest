/* eslint-disable prettier/prettier */
import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { AddBookArgs } from './add-book.args';

@InputType()
export class UpdateBookArgs extends PartialType(AddBookArgs) {
  @Field(() => Int)
  id: number;
}
