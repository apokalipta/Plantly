// Configuration applicative: port et environnement.
import { registerAs } from '@nestjs/config';
// Intention: Centraliser la configuration applicative
// Objectif: Exposer des valeurs typées et lisibles via ConfigService
// Logique: Lecture des variables d’environnement avec valeurs par défaut

export const AppConfig = registerAs('app', () => ({
  // Port HTTP de l'API
  port: parseInt(process.env.PORT || '3000', 10),
  // Environnement en cours (dev/prod)
  env: process.env.NODE_ENV || 'development',
  // TODO: add more app-level config
}));
