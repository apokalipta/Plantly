// Configuration base de données: URL et futurs réglages.
import { registerAs } from '@nestjs/config';
// Intention: Configuration de la base de données
// Objectif: Uniformiser l’accès à DATABASE_URL et futurs réglages
// Logique: Registre ConfigModule pour injection et lecture typée

export const DbConfig = registerAs('db', () => ({
  // URL de connexion Prisma
  url: process.env.DATABASE_URL || '',
  // TODO: pool config, SSL, etc.
}));
