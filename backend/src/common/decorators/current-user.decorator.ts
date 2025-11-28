import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to access the current authenticated user from the request.
 * TODO: Replace with proper JWT-based user extraction.
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

