// Module télémétrie: assemble contrôleur + service, dépendances DB et alertes.
import { Module } from '@nestjs/common';
import { HmacService } from '../../security/hmac.service';
import { DeviceTelemetryController } from './device-telemetry.controller';
import { DeviceTelemetryService } from './device-telemetry.service';
import { DatabaseModule } from '../../database/database.module';
import { AlertsModule } from '../alerts/alerts.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [DatabaseModule, AlertsModule, AchievementsModule],
  controllers: [DeviceTelemetryController],
  // Service
  providers: [DeviceTelemetryService, HmacService],
})
export class DeviceTelemetryModule {}
