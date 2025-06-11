/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { UseGuards } from '@nestjs/common';
import { Query, Resolver, Context } from '@nestjs/graphql';
import { JwtGuard } from './auth/guards/jwt.guard';
import { RoleGuard, Roles } from './auth/guards/role.guard';

@Resolver(() => String)
export class AppResolver {
  @Query(() => String)
  index(): string {
    return 'NestJS GraphQL Server - User Registration & Book Management';
  }

  @Query(() => String)
  @UseGuards(JwtGuard, new RoleGuard(Roles.USER))
  securedDataforUser(@Context() context: any): string {
    const user = context.user;
    return 'This is Secured data for User...!' + JSON.stringify(user);
  }

  @Query(() => String)
  @UseGuards(JwtGuard, new RoleGuard(Roles.ADMIN))
  securedDataforAdmin(@Context() context: any): string {
    const user = context.user;
    return 'This is Secured data for Admin...!' + JSON.stringify(user);
  }
}
