// Module succès: assemble contrôleur + service, dépendance DB.
import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { DatabaseModule } from '../../database/database.module';
import { AchievementsEngineService } from '../../achievements/achievements-engine.service';

@Module({
  // Dépendance DB (Prisma)
  imports: [DatabaseModule],
  // Contrôleur
  controllers: [AchievementsController],
  providers: [AchievementsService, AchievementsEngineService],
  exports: [AchievementsEngineService],
})
export class AchievementsModule {}
