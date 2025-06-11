import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class LoginResult {
  @Field()
  message: string;

  @Field()
  access_token: string;

  @Field()
  refresh_token: string;
}
