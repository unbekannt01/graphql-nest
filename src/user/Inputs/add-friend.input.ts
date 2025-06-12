// add-friend.input.ts
import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class AddFriendInput {
  @Field(() => Int)
  userId: number;

  @Field(() => Int)
  friendId: number;
}
