/* eslint-disable prettier/prettier */
import { Directive, Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddBookArgs {
  @Directive('@upper')
  @Field()
  title: string;

  @Field(() => Int)
  price: number;
}
