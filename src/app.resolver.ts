/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver, Context } from '@nestjs/graphql';
import { AuthGuard } from './auth/guards/auth.guard';
import * as jwt from 'jsonwebtoken';
import { JwtGuard } from './auth/guards/jwt.guard';
import { LoginResult } from './user/loginResult';
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

  @Query(() => LoginResult)
  @UseGuards(AuthGuard)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: any,
  ): Promise<{ message: string; access_token: string }> {
    const { res, user } = context;

    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, 'key', { expiresIn: '24h' });

    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Login Successfully...!',
      access_token: token,
    };
  }
}
