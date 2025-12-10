import { Module } from '@nestjs/common';
import { MediaService } from './index';
import { ConfigModule } from '@nestjs/config';
// Intention: Encapsuler le service médias et ses dépendances de configuration
// Objectif: Permettre l’injection propre dans les modules consommateurs
// Logique: Export du service et import du ConfigModule pour lire les envs

@Module({
  imports: [ConfigModule],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

