import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddFriendArgs {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  friendId: number;
}
