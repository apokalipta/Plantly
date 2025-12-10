// Module wiki: expose contrôleur et service avec accès base.
import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { WikiController } from './wiki.controller';
import { WikiService } from './wiki.service';
import { AdminPlantsController } from './admin-plants.controller';
import { MediaModule } from '../../media/media.module';
// Intention: Module wiki encapsulant contrôleurs public et admin
// Objectif: Isoler l’accès aux médias et à la base
// Logique: Import dépendances, déclare services et contrôleurs

@Module({
  imports: [DatabaseModule, MediaModule],
  controllers: [WikiController, AdminPlantsController],
  providers: [WikiService],
})
export class WikiModule {}
