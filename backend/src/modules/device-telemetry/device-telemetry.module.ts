// Module télémétrie: assemble contrôleur + service, dépendances DB et alertes.
import { Module } from '@nestjs/common';
import { DeviceTelemetryController } from './device-telemetry.controller';
import { DeviceTelemetryService } from './device-telemetry.service';
import { DatabaseModule } from '../../database/database.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  // Dépendances
  imports: [DatabaseModule, AlertsModule],
  // Contrôleur
  controllers: [DeviceTelemetryController],
  // Service
  providers: [DeviceTelemetryService],
})
export class DeviceTelemetryModule {}
