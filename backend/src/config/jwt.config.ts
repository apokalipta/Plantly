// Configuration JWT: secrets d'accès et de rafraîchissement.
import { registerAs } from '@nestjs/config';

export const JwtConfig = registerAs('jwt', () => ({
  // Secret pour signer le jeton d'accès
  accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  // Secret pour signer le jeton de rafraîchissement
  refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
  // TODO: token expiry, issuer, audience
}));

