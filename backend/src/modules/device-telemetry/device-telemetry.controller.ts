// Contrôleur télémétrie: point d’entrée HTTP, validation basique, délégation au service.
import { Body, Controller, Headers, Post } from '@nestjs/common';
import { DeviceTelemetryService } from './device-telemetry.service';
import { TelemetryDto } from './dto/telemetry.dto';
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
// Intention: Point d’entrée d’ingestion des télémétries des appareils
// Objectif: Exiger des en-têtes d’authentification HMAC et un payload valide
// Logique: Déléguer la validation profonde et l’écriture au service dédié

// Doc Swagger (tag)
@ApiTags('device-telemetry')
// Route de base (préfixée par /api)
@Controller('device/telemetry')
export class DeviceTelemetryController {
  // Injection du service
  constructor(private readonly service: DeviceTelemetryService) {}

  // Endpoint POST d’ingestion
  @Post()
  // Doc Swagger (opération)
  @ApiOperation({ summary: 'Ingest telemetry from a physical device (secured via HMAC)' })
  // Schéma d’entrée + exemple
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
  // Réponse 200
  @ApiOkResponse({ description: 'Telemetry accepted', schema: { example: { status: 'ok' } } })
  // Réponse 401
  @ApiUnauthorizedResponse({ description: 'Invalid signature or unknown device' })
  // Réponse 400
  @ApiBadRequestResponse({ description: 'Invalid payload or timestamp' })
  async ingest(
    @Headers('X-DEVICE-UID') deviceUid: string,
    @Headers('X-DEVICE-TIMESTAMP') headerTimestamp: string,
    @Headers('X-DEVICE-SIGNATURE') signature: string,
    @Body() dto: TelemetryDto,
  ): Promise<{ status: string }> {
    // Appel au service
    return this.service.handleTelemetry(deviceUid, headerTimestamp, signature, dto);
  }

  @Post('simple')
  @ApiOperation({ summary: 'Simple ingestion for prototypes (no HMAC)' })
  @ApiBody({ type: TelemetryDto })
  async ingestSimple(@Body() dto: TelemetryDto): Promise<{ status: string }> {
    return this.service.handleTelemetrySimple(dto);
  }

  @Post('simple/base-raw')
  @ApiOperation({ summary: 'Simple ingestion for base prototypes (single payload for 4 slots)' })
  async ingestSimpleBaseRaw(@Body() dto: any): Promise<{ status: string }> {
    const baseUid = typeof dto?.baseUid === 'string' && dto.baseUid.length > 0 ? dto.baseUid : 'BASE_TEST_01';
    const timestamp = typeof dto?.timestamp === 'string' && dto.timestamp.length > 0 ? dto.timestamp : new Date().toISOString();

    const toNumber = (v: any): number | undefined => {
      if (v === undefined || v === null) return undefined;
      const n = Number(String(v).replace(',', '.').trim());
      return Number.isFinite(n) ? n : undefined;
    };

    const toPercent = (v: any): number | undefined => {
      if (v === undefined || v === null) return undefined;
      const s = String(v).trim();
      const n = Number(s.replace('%', '').replace(',', '.'));
      if (!Number.isFinite(n)) return undefined;
      if (n < 0) return 0;
      if (n > 100) return 100;
      return n;
    };

    const common = {
      baseUid,
      timestamp,
      temperature: toNumber(dto?.temp),
      airHumidity: toNumber(dto?.airHum),
      lightLevel: toNumber(dto?.lux),
    };

    for (let slotIndex = 1; slotIndex <= 4; slotIndex++) {
      const soilMoisture = toPercent(dto?.[`pot${slotIndex}`]);
      const payload: any = { ...common, slotIndex, soilMoisture };
      await this.service.handleTelemetrySimple(payload);
    }

    return { status: 'ok' };
  }
}
