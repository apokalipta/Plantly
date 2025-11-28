import { Controller, Get, Param, NotImplementedException } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get(':deviceId')
  async list(@Param('deviceId') _deviceId: string): Promise<void> {
    // TODO: list alerts for device
    throw new NotImplementedException();
  }
}

