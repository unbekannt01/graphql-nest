import { Directive, Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddBookArgs {
  @Field(() => Int)
  id: number;

  @Directive('@upper')
  @Field()
  title: string;

  @Field(() => Int)
  price: number;
}
