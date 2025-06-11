/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ForbiddenException } from '@nestjs/common';
import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';
import { Roles } from '../guards/role.guard';

export const checkRoleMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const { info } = ctx;
  const { extensions } = info.parentType.getFields()[info.fieldName];

  const userRole = Roles.USER;
  if (userRole === extensions.role) {
    throw new ForbiddenException(
      `User does not have sufficient permissions to access "${info.fieldName}" field.`,
    );
  }
  return next();
};
