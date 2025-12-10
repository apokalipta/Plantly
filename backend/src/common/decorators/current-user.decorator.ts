// Décorateur `CurrentUser`: récupère l'utilisateur authentifié depuis la requête.
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Intention: Fournir une abstraction pour récupérer l’utilisateur courant
// Objectif: Diminuer le couplage aux détails de la stratégie JWT
// Logique: Extraction depuis request.user (peuplé par JwtStrategy)
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  // Extraction depuis `request.user` (alimenté par la stratégie JWT)
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

