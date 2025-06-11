/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as jwt from 'jsonwebtoken';

interface GraphQLContext {
  req: { headers: { authorization?: string } };
  user?: any;
}

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const ctx =
      GqlExecutionContext.create(context).getContext<GraphQLContext>();
    const authorizationHeader = ctx.req.headers.authorization;

    if (authorizationHeader) {
      const token = authorizationHeader.split(' ')[1];
      try {
        const user = jwt.verify(token, 'key') as jwt.JwtPayload;
        // Add user ID to context for easier access
        ctx.user = { ...user, userId: user.id };
        return true;
      } catch (error: any) {
        throw new HttpException(
          'Invalid Token: ' + error.message,
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
    throw new HttpException(
      'Authorization header not found',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
