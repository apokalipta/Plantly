// Configuration base de données: URL et futurs réglages.
import { registerAs } from '@nestjs/config';

export const DbConfig = registerAs('db', () => ({
  // URL de connexion Prisma
  url: process.env.DATABASE_URL || '',
  // TODO: pool config, SSL, etc.
}));

