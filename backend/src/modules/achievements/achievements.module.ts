// Module succès: assemble contrôleur + service, dépendance DB.
import { Module } from '@nestjs/common';
import { AchievementsController } from './achievements.controller';
import { AchievementsService } from './achievements.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  // Dépendance DB (Prisma)
  imports: [DatabaseModule],
  // Contrôleur
  controllers: [AchievementsController],
  // Service
  providers: [AchievementsService],
})
export class AchievementsModule {}
