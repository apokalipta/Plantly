// Service télémétrie: ingestion, validations essentielles, persistance et mise à jour des alertes.
import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { AchievementsEngineService } from '../../achievements/achievements-engine.service';
import { AchievementEventType } from '../../achievements/AchievementEventType';
import { TelemetryDto } from './dto/telemetry.dto';
import * as crypto from 'crypto';
// Intention: Ingestion sécurisée et robuste des télémétries des appareils
// Objectif: Authentifier la source, valider la charge utile et déclencher des alertes pertinentes
// Logique: Vérification HMAC, contrôle des horodatages, enregistrement, puis évaluation des seuils

@Injectable()
export class DeviceTelemetryService {
  // Injections
  constructor(private readonly prisma: PrismaService, private readonly alerts: AlertsService, private readonly achievements: AchievementsEngineService) {}

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
    const parsedHeaderTs = this.parseTimestamp(headerTimestamp);
    if (!parsedHeaderTs) {
      throw new BadRequestException('Invalid timestamp header');
    }
    const now = Date.now();
    const skewMs = 5 * 60 * 1000; // TODO: configure allowed time skew
    if (Math.abs(now - parsedHeaderTs.getTime()) > skewMs) {
      throw new UnauthorizedException('Timestamp too far from server time');
    }

    // Vérifier signature HMAC (placeholder)
    // TODO: Retrieve real secret (not hashed) to compute HMAC. Current schema stores deviceSecretHash.
    const payloadString = JSON.stringify(dto) + headerTimestamp;
    const hmacKey = String((device as any).deviceSecretHash || '');
    const expected = crypto.createHmac('sha256', hmacKey).update(payloadString).digest('hex');
    const provided = (signature || '').toLowerCase();
    if (expected !== provided) {
      throw new UnauthorizedException('Invalid signature');
    }
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
    const latestReading = {
      timestamp: readingTimestamp,
      soilMoisture: dto.soilMoisture,
      lightLevel: dto.lightLevel,
    } as any;
    const status = this.computeStatus(device as any, latestReading as any, plantCare as any);
    if (status === 'OK') {
      await this.alerts.resolveAllForDevice(device.id);
    } else {
      // Intention: produire des alertes ciblées selon l’écart aux seuils de soin
      const moistureMin = (plantCare?.minMoisture ?? 30) as number;
      const moistureMax = (plantCare?.maxMoisture ?? 70) as number;
      const lightMin = (plantCare?.minLight ?? 200) as number;
      const lightMax = (plantCare?.maxLight ?? 1000) as number;
      const sm = dto.soilMoisture;
      const ll = dto.lightLevel;
      if (typeof sm === 'number') {
        if (sm < moistureMin) {
          await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'WATER_NEEDED', status === 'BAD' ? 'CRITICAL' : 'WARNING');
        } else if (sm > moistureMax) {
          await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'OTHER', status === 'BAD' ? 'CRITICAL' : 'WARNING');
        }
      }
      if (typeof ll === 'number') {
        if (ll < lightMin) {
          await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'LIGHT_TOO_LOW', status === 'BAD' ? 'CRITICAL' : 'WARNING');
        } else if (ll > lightMax) {
          await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'LIGHT_TOO_HIGH', status === 'BAD' ? 'CRITICAL' : 'WARNING');
        }
      }
    }

    if (typeof dto.batteryLevel === 'number') {
      if (dto.batteryLevel <= 10) {
        await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'BATTERY_LOW', 'CRITICAL');
      } else if (dto.batteryLevel < 20) {
        await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'BATTERY_LOW', 'WARNING');
      }
    }

    // Confirmer
    return { status: 'ok' };
  }

  // Parse timestamp (ISO ou epoch ms)
  private parseTimestamp(ts: string): Date | null {
    if (!ts) return null;
    // Try ISO 8601
    const iso = new Date(ts);
    if (!isNaN(iso.getTime())) return iso;
    // Try epoch (ms)
    const num = Number(ts);
    if (!isNaN(num)) {
      const d = new Date(num);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  }

  private computeStatus(
    device: { lastSeenAt: Date | null },
    latestReading?: { timestamp: Date; soilMoisture?: number; lightLevel?: number } | null,
    plantCare?: { minMoisture?: number | null; maxMoisture?: number | null; minLight?: number | null; maxLight?: number | null } | null,
  ): 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE' {
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
    const moistureStatus = evalMetric(soilMoisture as any, moistureMin as any, moistureMax as any);
    const lightStatus = evalMetric(lightLevel as any, lightMin as any, lightMax as any);
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
}
