import { Field, InputType, Int, OmitType, PartialType } from '@nestjs/graphql';
import { RegisterUserArgs } from './register-user.args';

@InputType()
export class UpdateUserArgs extends PartialType(
  OmitType(RegisterUserArgs, ['role'] as const),
) {
  @Field(() => Int)
  id: number;
}
