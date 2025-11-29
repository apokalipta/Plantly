import { Body, Controller, Headers, Post } from '@nestjs/common';
import { DeviceTelemetryService } from './device-telemetry.service';
import { TelemetryDto } from './dto/telemetry.dto';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@ApiTags('device-telemetry')
@Controller('device/telemetry')
export class DeviceTelemetryController {
  constructor(private readonly service: DeviceTelemetryService) {}

  @Post()
  @ApiOperation({ summary: 'Ingest telemetry from a physical device (secured via HMAC)' })
  @ApiBody({
    type: TelemetryDto,
    examples: {
      example: {
        value: {
          timestamp: '2025-01-01T10:00:00Z',
          soilMoisture: 42.5,
          lightLevel: 650,
          temperature: 21.1,
          batteryLevel: 88,
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Telemetry accepted', schema: { example: { status: 'ok' } } })
  @ApiUnauthorizedResponse({ description: 'Invalid signature or unknown device' })
  @ApiBadRequestResponse({ description: 'Invalid payload or timestamp' })
  async ingest(
    @Headers('X-DEVICE-UID') deviceUid: string,
    @Headers('X-DEVICE-TIMESTAMP') headerTimestamp: string,
    @Headers('X-DEVICE-SIGNATURE') signature: string,
    @Body() dto: TelemetryDto,
  ): Promise<{ status: string }> {
    return this.service.handleTelemetry(deviceUid, headerTimestamp, signature, dto);
  }
}

