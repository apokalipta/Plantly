// Service télémétrie: ingestion, validations essentielles, persistance et mise à jour des alertes.
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { AchievementsEngineService } from '../../achievements/achievements-engine.service';
import { AchievementEventType } from '../../achievements/AchievementEventType';
import { TelemetryDto } from './dto/telemetry.dto';
import { HmacService } from '../../security/hmac.service';
// Intention: Ingestion sécurisée et robuste des télémétries des appareils
// Objectif: Authentifier la source, valider la charge utile et déclencher des alertes pertinentes
// Logique: Vérification HMAC, contrôle des horodatages, enregistrement, puis évaluation des seuils

@Injectable()
export class DeviceTelemetryService {
  constructor(private readonly prisma: PrismaService, private readonly alerts: AlertsService, private readonly achievements: AchievementsEngineService, private readonly hmac?: HmacService) {}

  async handleTelemetry(
    deviceUid: string,
    headerTimestamp: string,
    signature: string,
    dto: TelemetryDto,
  ): Promise<{ status: string }> {
    // Vérifier device + horodatage + signature, puis persister et mettre à jour le statut
    const device = await this.prisma.device.findUnique({ where: { deviceUid } });
    if (!device) {
      throw new UnauthorizedException('Unknown device UID');
    }

    // Valider horodatage (±5 min)
    const hmacSvc = this.hmac ?? new HmacService();
    const parsedHeaderTs = hmacSvc.verifyTimestamp(headerTimestamp, 2 * 60 * 1000);

    hmacSvc.verifySignature(String((device as any).deviceSecretHash || ''), dto, headerTimestamp, signature);
    // Sécurité: le HMAC protège contre l’altération; la clé doit rester secrète côté appareil/serveur

    // Valider timestamp de la mesure
    const readingTimestamp = this.parseTimestamp(dto.timestamp);
    if (!readingTimestamp) {
      throw new BadRequestException('Invalid telemetry timestamp');
    }
    const headerTs = parsedHeaderTs.getTime();
    const bodyTs = readingTimestamp.getTime();
    const bodyHeaderMaxDeltaMs = 10 * 60 * 1000; // 10 minutes tolerance
    if (Math.abs(bodyTs - headerTs) > bodyHeaderMaxDeltaMs) {
      throw new BadRequestException('Body/header timestamp mismatch');
    }
    // Sécurité: limite la fenêtre d’acceptation pour réduire les rejoués et dérives d’horloge

    const hasValue = [dto.soilMoisture, dto.lightLevel, dto.temperature, dto.batteryLevel].some((v) => v !== undefined && v !== null);
    if (!hasValue) {
      throw new BadRequestException('No telemetry values provided');
    }
    // Robustesse: refuse les lectures vides afin d’éviter du bruit dans les séries temporelles

    // Persister lecture
    await this.prisma.sensorReading.create({
      data: {
        deviceId: device.id,
        timestamp: readingTimestamp,
        soilMoisture: dto.soilMoisture ?? null,
        lightLevel: dto.lightLevel ?? null,
        temperature: dto.temperature ?? null,
      },
    });

    if (device.ownerId) {
      await this.achievements.onEvent(device.ownerId, AchievementEventType.SENSOR_READING_RECEIVED, {
        deviceId: device.id,
        reading: {
          soilMoisture: dto.soilMoisture,
          lightLevel: dto.lightLevel,
          temperature: dto.temperature,
          timestamp: readingTimestamp,
        },
      });
    }

    // Mettre à jour lastSeenAt
    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    // Calculer statut global + synchroniser alertes
    const plant = await this.prisma.plantInstance.findFirst({
      where: { deviceId: device.id, status: 'ACTIVE' },
      orderBy: { plantedAt: 'desc' },
    });
    const plantCare = plant ? await this.prisma.plantCare.findUnique({ where: { speciesId: plant.speciesId } }) : null;
    const latestReading: { timestamp: Date; soilMoisture?: number; lightLevel?: number } = {
      timestamp: readingTimestamp,
      soilMoisture: dto.soilMoisture,
      lightLevel: dto.lightLevel,
    };
    const status = this.computeStatus({ lastSeenAt: device.lastSeenAt }, latestReading, plantCare);
    if (status === 'OK') {
      await this.alerts.resolveAllForDevice(device.id);
    } else {
      await this.evaluateAlerts(device.id, plant ? String(plant.id) : null, status, plantCare, dto.soilMoisture, dto.lightLevel);
    }

    await this.syncBatteryAlerts(device.id, plant ? String(plant.id) : null, dto.batteryLevel);

    // Confirmer
    return { status: 'ok' };
  }

  // Parse timestamp (ISO ou epoch ms)
  private parseTimestamp(ts: string): Date | null {
    if (!ts) return null;
    // Try ISO 8601
    const iso = new Date(ts);
    if (!Number.isNaN(iso.getTime())) return iso;
    // Try epoch (ms)
    const num = Number(ts);
    if (!Number.isNaN(num)) {
      const d = new Date(num);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return null;
  }

  private computeStatus(
    device: { lastSeenAt: Date | null },
    latestReading?: { timestamp: Date; soilMoisture?: number; lightLevel?: number } | null,
    plantCare?: { minMoisture?: number | null; maxMoisture?: number | null; minLight?: number | null; maxLight?: number | null } | null,
  ): DeviceStatus {
    const MOISTURE_MIN = 30;
    const MOISTURE_MAX = 70;
    const LIGHT_MIN = 200;
    const LIGHT_MAX = 1000;
    const RANGE_TOLERANCE_RATIO = 0.1;
    const now = Date.now();
    if (!device.lastSeenAt) {
      return 'OFFLINE';
    }
    const lastSeenMs = new Date(device.lastSeenAt).getTime();
    if (now - lastSeenMs > 30 * 60 * 1000) {
      return 'OFFLINE';
    }
    if (!latestReading) {
      return 'ACTION_REQUIRED';
    }
    const soilMoisture = latestReading.soilMoisture;
    const lightLevel = latestReading.lightLevel;
    const moistureMin = plantCare?.minMoisture ?? MOISTURE_MIN;
    const moistureMax = plantCare?.maxMoisture ?? MOISTURE_MAX;
    const lightMin = plantCare?.minLight ?? LIGHT_MIN;
    const lightMax = plantCare?.maxLight ?? LIGHT_MAX;
    const evalMetric = (value: number | undefined, min: number, max: number) => {
      if (value === undefined || value === null) return 'missing' as const;
      const range = max - min;
      const margin = range * RANGE_TOLERANCE_RATIO;
      const outerMin = min - margin;
      const outerMax = max + margin;
      if (value >= min && value <= max) return 'good' as const;
      if (value >= outerMin && value <= outerMax) return 'slight' as const;
      return 'bad' as const;
    };
    const moistureStatus = evalMetric(soilMoisture, moistureMin, moistureMax);
    const lightStatus = evalMetric(lightLevel, lightMin, lightMax);
    if (moistureStatus === 'bad' || lightStatus === 'bad') {
      return 'BAD';
    }
    if (moistureStatus === 'slight' || lightStatus === 'slight') {
      return 'ACTION_REQUIRED';
    }
    if (moistureStatus === 'missing' && lightStatus === 'missing') {
      return 'ACTION_REQUIRED';
    }
    return 'OK';
  }

  private async evaluateAlerts(
    deviceId: string,
    plantId: string | null,
    status: DeviceStatus,
    plantCare: { minMoisture?: number | null; maxMoisture?: number | null; minLight?: number | null; maxLight?: number | null } | null,
    soilMoisture?: number,
    lightLevel?: number,
  ): Promise<void> {
    const severity = this.getSeverity(status);
    const moistureMin = plantCare?.minMoisture ?? 30;
    const moistureMax = plantCare?.maxMoisture ?? 70;
    await this.createRangeAlert({ deviceId, plantId, value: soilMoisture, min: moistureMin, max: moistureMax, lowCode: 'WATER_NEEDED', highCode: 'OTHER', severity });
    const lightMin = plantCare?.minLight ?? 200;
    const lightMax = plantCare?.maxLight ?? 1000;
    await this.createRangeAlert({ deviceId, plantId, value: lightLevel, min: lightMin, max: lightMax, lowCode: 'LIGHT_TOO_LOW', highCode: 'LIGHT_TOO_HIGH', severity });
  }

  private async syncBatteryAlerts(deviceId: string, plantId: string | null, battery?: number): Promise<void> {
    if (typeof battery !== 'number') return;
    if (battery <= 10) {
      await this.alerts.createOrUpdate(deviceId, plantId, 'BATTERY_LOW', 'CRITICAL');
    } else if (battery < 20) {
      await this.alerts.createOrUpdate(deviceId, plantId, 'BATTERY_LOW', 'WARNING');
    }
  }

  private getSeverity(status: DeviceStatus): 'CRITICAL' | 'WARNING' {
    return status === 'BAD' ? 'CRITICAL' : 'WARNING';
  }

  private async createRangeAlert(opts: {
    deviceId: string;
    plantId: string | null;
    value?: number;
    min: number;
    max: number;
    lowCode: 'WATER_NEEDED' | 'LIGHT_TOO_LOW' | 'OTHER';
    highCode: 'LIGHT_TOO_HIGH' | 'OTHER';
    severity: 'CRITICAL' | 'WARNING';
  }): Promise<void> {
    const { deviceId, plantId, value, min, max, lowCode, highCode, severity } = opts;
    if (typeof value !== 'number') return;
    if (value < min) {
      await this.alerts.createOrUpdate(deviceId, plantId, lowCode, severity);
    } else if (value > max) {
      await this.alerts.createOrUpdate(deviceId, plantId, highCode, severity);
    }
  }
}
type DeviceStatus = 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE';
