import { CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/user/entities/user.entity';

interface GqlContextType {
  user?: User;
}

export const Roles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

export class RoleGuard implements CanActivate {
  constructor(private readonly role: string) {
    this.role = role;
  }

  canActivate(context: ExecutionContext): boolean {
    const ctx =
      GqlExecutionContext.create(context).getContext<GqlContextType>();

    if (ctx.user && ctx.user.role == this.role) return true;
    return false;
  }
}
