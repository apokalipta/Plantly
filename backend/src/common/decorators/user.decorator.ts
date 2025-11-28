import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  // TODO: extract user from request after auth implementation
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

