import { Module } from '@nestjs/common';
import { DeviceTelemetryController } from './device-telemetry.controller';
import { DeviceTelemetryService } from './device-telemetry.service';
import { DatabaseModule } from '../../database/database.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [DatabaseModule, AlertsModule],
  controllers: [DeviceTelemetryController],
  providers: [DeviceTelemetryService],
})
export class DeviceTelemetryModule {}
