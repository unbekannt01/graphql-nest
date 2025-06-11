import { FieldMiddleware, MiddlewareContext, NextFn } from '@nestjs/graphql';

export const loggerMiddleware: FieldMiddleware = async (
  ctx: MiddlewareContext,
  next: NextFn,
) => {
  const value: unknown = await next();
  console.log(value);
  return value;
};
