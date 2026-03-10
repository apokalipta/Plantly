// Configuration JWT: secrets d'accès et de rafraîchissement.
import { registerAs } from '@nestjs/config';
// Intention: Configurer les secrets JWT (access/refresh)
// Objectif: Centraliser la lecture sécurisée des clés et options
// Logique: Exposition via ConfigService, à compléter avec issuer/audience/exp

export const JwtConfig = registerAs('jwt', () => ({
  // Secret pour signer le jeton d'accès
  accessSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  // Secret pour signer le jeton de rafraîchissement
  refreshSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
  // Durée de validité du jeton d'accès
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
  // Durée de validité du jeton de rafraîchissement
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  // Nombre de tours pour le hachage bcrypt
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
}));

