/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

interface GqlContextType {
  req: {
    body: {
      variables?: {
        email?: string;
        password?: string;
      };
      query?: string;
    };
  };
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const ctx = gqlContext.getContext<GqlContextType>();

    // Get the arguments directly from the GraphQL context
    const args = gqlContext.getArgs();
    const email = args.email;
    const password = args.password;

    if (!email || !password) {
      console.log('Failed login attempt - missing credentials');
      throw new HttpException(
        'Email and password are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.userService.findUserByEmail(email);
    if (user && user.password === password) {
      ctx.user = user;
      return true;
    } else {
      throw new HttpException(
        'You are Unauthenticated...!',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
