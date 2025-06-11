import { Directive, Field, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Book {
  @Field(() => GraphQLJSON)
  info: JSON;

  @Field(() => Int)
  id: number;

  @Directive('@upper')
  @Field({ complexity: 3 })
  title: string;

  @Field(() => Int)
  price: number;
}
