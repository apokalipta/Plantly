import { registerAs } from '@nestjs/config';

export const DbConfig = registerAs('db', () => ({
  url: process.env.DATABASE_URL || '',
  // TODO: pool config, SSL, etc.
}));

