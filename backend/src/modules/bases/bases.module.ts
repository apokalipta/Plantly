import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { BasesController } from './bases.controller';
import { BasesService } from './bases.service';

@Module({
  imports: [DatabaseModule, AlertsModule, AchievementsModule],
  controllers: [BasesController],
  providers: [BasesService],
})
export class BasesModule {}
