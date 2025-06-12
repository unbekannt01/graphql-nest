/* eslint-disable prettier/prettier */
import {
  Field,
  ObjectType,
  InterfaceType,
  createUnionType,
  registerEnumType,
  Extensions,
  ID,
} from '@nestjs/graphql';
import { Roles } from 'src/auth/guards/role.guard';
import { Book } from 'src/book/schema/book.schema';
import { UploadFile as UploadFileSchema } from 'src/upload/schema/upload.schema'

// Define a generic Person interface
@InterfaceType()
export abstract class Person {
  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

// User implements Person
@ObjectType({ implements: Person })
export class User implements Person {
  // @Field(() => GraphQLJSON)
  // info: JSON;

  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Extensions({ role: Roles.USER })
  @Field()
  role: string;

  @Field(() => [Book], { nullable: true })
  books?: Book[];

  @Field(() => [UploadFileSchema], { nullable: true })
  uploadFiles?: UploadFileSchema[];

  @Field(() => [User], { nullable: true })
  friends?: User[];

  @Field(() => [UploadFileSchema], { nullable: true })
  files?: UploadFileSchema[];
}

// Another type implementing the same interface
@ObjectType({ implements: Person })
export class Admin implements Person {
  @Field(() => ID)
  id: number;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  adminLevel: string;
}

// Example Enum
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'The roles a user can have',
});

// Example Union Type
export const UserOrAdminUnion = createUnionType({
  name: 'UserOrAdmin', // the name in the GraphQL schema
  types: () => [User, Admin] as const,
  resolveType(value) {
    if ('role' in value) {
      return User;
    }
    if ('adminLevel' in value) {
      return Admin;
    }
    return null;
  },
});

// Example usage in a resolver (not required in this file, just for reference):
// @Query(() => UserOrAdminUnion)
// getUserOrAdmin(@Args('id') id: number): Promise<typeof UserOrAdminUnion> {
//   // return either a User or Admin instance
// }
