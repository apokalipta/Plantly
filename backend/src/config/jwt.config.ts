import { registerAs } from '@nestjs/config';

export const JwtConfig = registerAs('jwt', () => ({
  accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
  // TODO: token expiry, issuer, audience
}));

