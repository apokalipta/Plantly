// Décorateur `CurrentUser`: récupère l'utilisateur authentifié depuis la requête.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  // Extraction depuis `request.user` (alimenté par la stratégie JWT)
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

