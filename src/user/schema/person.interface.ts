// src/user/schema/person.interface.ts
import { Field, InterfaceType, ID } from '@nestjs/graphql';

@InterfaceType()
export abstract class Person {
  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
