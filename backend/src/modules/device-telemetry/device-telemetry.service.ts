import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlertsService } from '../alerts/alerts.service';
import { DevicesService } from '../devices/devices.service';
import { TelemetryDto } from './dto/telemetry.dto';
import * as crypto from 'crypto';

@Injectable()
export class DeviceTelemetryService {
  constructor(private readonly prisma: PrismaService, private readonly alerts: AlertsService) {}

  async handleTelemetry(
    deviceUid: string,
    headerTimestamp: string,
    signature: string,
    dto: TelemetryDto,
  ): Promise<{ status: string }> {
    const device = await this.prisma.device.findUnique({ where: { deviceUid } });
    if (!device) {
      throw new UnauthorizedException('Unknown device UID');
    }

    const parsedHeaderTs = this.parseTimestamp(headerTimestamp);
    if (!parsedHeaderTs) {
      throw new BadRequestException('Invalid timestamp header');
    }
    const now = Date.now();
    const skewMs = 5 * 60 * 1000; // TODO: configure allowed time skew
    if (Math.abs(now - parsedHeaderTs.getTime()) > skewMs) {
      throw new UnauthorizedException('Timestamp too far from server time');
    }

    // TODO: Retrieve real secret (not hashed) to compute HMAC. Current schema stores deviceSecretHash.
    // For now, prepare structure and bypass strict verification with a TODO.
    const payloadString = JSON.stringify(dto) + headerTimestamp;
    const secret = 'TODO_DEVICE_SECRET'; // TODO: replace with real secret management
    const expected = crypto.createHmac('sha256', secret).update(payloadString).digest('hex');
    const provided = (signature || '').toLowerCase();
    const acceptable = true; // TODO: set to (expected === provided) when real secret available
    if (!acceptable) {
      throw new UnauthorizedException('Invalid signature');
    }

    const readingTimestamp = this.parseTimestamp(dto.timestamp);
    if (!readingTimestamp) {
      throw new BadRequestException('Invalid telemetry timestamp');
    }

    await this.prisma.sensorReading.create({
      data: {
        deviceId: device.id,
        timestamp: readingTimestamp,
        soilMoisture: dto.soilMoisture ?? null,
        lightLevel: dto.lightLevel ?? null,
        temperature: dto.temperature ?? null,
      },
    });

    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date() },
    });

    const plant = await this.prisma.plantInstance.findFirst({
      where: { deviceId: device.id, status: 'ACTIVE' },
      orderBy: { plantedAt: 'desc' },
    });
    const plantCare = plant ? await this.prisma.plantCare.findUnique({ where: { speciesId: plant.speciesId } }) : null;
    const devicesService = new DevicesService(this.prisma as any);
    const latestReading = {
      timestamp: readingTimestamp,
      soilMoisture: dto.soilMoisture,
      lightLevel: dto.lightLevel,
    } as any;
    const status = (devicesService as any).computeGlobalStatus(device as any, latestReading as any, plantCare as any);
    if (status === 'BAD') {
      await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'OTHER', 'CRITICAL');
    } else if (status === 'ACTION_REQUIRED') {
      await this.alerts.createOrUpdate(device.id, plant ? plant.id : null, 'OTHER', 'WARNING');
    } else if (status === 'OK') {
      await this.alerts.resolveAllForDevice(device.id);
    }

    return { status: 'ok' };
  }

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
}
