import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ListPotsResponseDto } from './dto/list-pots.response.dto';
import { PotDetailsResponseDto } from './dto/pot-details.response.dto';
import { LinkPotDto } from './dto/link-pot.dto';
import { ProvisionDeviceDto } from './dto/provision-device.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly MOISTURE_MIN = 30;
  private readonly MOISTURE_MAX = 70;
  private readonly LIGHT_MIN = 200;
  private readonly LIGHT_MAX = 1000;
  private readonly RANGE_TOLERANCE_RATIO = 0.1; // 10% tolerance

  async findUserPots(userId: string): Promise<ListPotsResponseDto[]> {
    const devices = await this.prisma.device.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    const results = await Promise.all(
      devices.map(async (d: any) => {
        const latest = await this.prisma.sensorReading.findFirst({
          where: { deviceId: d.id },
          orderBy: { timestamp: 'desc' },
        });
        const plant = await this.prisma.plantInstance.findFirst({
          where: { deviceId: d.id, status: 'ACTIVE' },
          orderBy: { plantedAt: 'desc' },
        });
        const plantCare = plant
          ? await this.prisma.plantCare.findUnique({ where: { speciesId: plant.speciesId } })
          : null;
        const globalStatus = this.computeGlobalStatus(d as any, latest as any, plantCare as any);
        const nextMeasurementIntervalMinutes = this.computeNextMeasurementIntervalMinutes(globalStatus);
        // TODO: expose nextMeasurementIntervalMinutes in the API or use it for device scheduling endpoints later.
        const item: ListPotsResponseDto = {
          id: d.id,
          name: d.name,
          deviceUid: d.deviceUid,
          lastSeenAt: d.lastSeenAt ?? undefined,
          globalStatus,
        };
        return item;
      })
    );

    return results;
  }

  async findUserPotById(userId: string, potId: string): Promise<PotDetailsResponseDto> {
    const device = await this.prisma.device.findFirst({ where: { id: potId, ownerId: userId } });
    if (!device) {
      throw new NotFoundException('Pot not found');
    }

    const plant = await this.prisma.plantInstance.findFirst({
      where: { deviceId: device.id, status: 'ACTIVE' },
      orderBy: { plantedAt: 'desc' },
    });

    const latest = await this.prisma.sensorReading.findFirst({
      where: { deviceId: device.id },
      orderBy: { timestamp: 'desc' },
    });

    const plantCare = plant
      ? await this.prisma.plantCare.findUnique({ where: { speciesId: plant.speciesId } })
      : null;
    const globalStatus = this.computeGlobalStatus(device as any, latest as any, plantCare as any);
    const nextMeasurementIntervalMinutes = this.computeNextMeasurementIntervalMinutes(globalStatus);
    // TODO: expose nextMeasurementIntervalMinutes in the API or use it for device scheduling endpoints later.

    const details: PotDetailsResponseDto = {
      id: device.id,
      name: device.name,
      deviceUid: device.deviceUid,
      lastSeenAt: device.lastSeenAt ?? undefined,
      globalStatus,
      plant: plant
        ? {
            id: plant.id,
            speciesId: plant.speciesId,
            nickname: plant.nickname ?? undefined,
            plantedAt: plant.plantedAt,
            status: String(plant.status),
          }
        : undefined,
      latestMeasurement: latest
        ? {
            timestamp: latest.timestamp,
            soilMoisture: latest.soilMoisture ?? undefined,
            lightLevel: latest.lightLevel ?? undefined,
            temperature: latest.temperature ?? undefined,
          }
        : undefined,
    };

    return details;
  }

  async provisionDevice(dto: ProvisionDeviceDto): Promise<{ deviceUid: string; pairingCode: string; name: string }> {
    const existing = await this.prisma.device.findUnique({ where: { deviceUid: dto.deviceUid } });
    if (existing) {
      throw new BadRequestException('Device UID already exists');
    }
    const code = this.generatePairingCode();
    const created = await this.prisma.device.create({
      data: {
        deviceUid: dto.deviceUid,
        deviceSecretHash: 'PROVISIONED_NO_SECRET',
        ownerId: null,
        name: dto.name ?? 'New Device',
        pairingCode: code,
        pairedAt: null,
      },
    });
    return { deviceUid: created.deviceUid, pairingCode: code, name: created.name };
  }

  async linkPotToUser(userId: string, dto: LinkPotDto): Promise<PotDetailsResponseDto> {
    const device = await this.prisma.device.findUnique({ where: { deviceUid: dto.deviceUid } });
    if (!device) {
      throw new NotFoundException('Device not found for provided UID');
    }
    if (device.ownerId) {
      throw new BadRequestException('Device already paired');
    }
    if (!dto.pairingCode || device.pairingCode !== dto.pairingCode) {
      throw new BadRequestException('Invalid pairing code');
    }
    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        ownerId: userId,
        name: dto.name ?? device.name,
        pairedAt: new Date(),
        pairingCode: null,
      },
    });

    if (dto.speciesId) {
      await this.prisma.plantInstance.create({
        data: {
          deviceId: updated.id,
          speciesId: dto.speciesId,
          nickname: dto.plantNickname ?? null,
          plantedAt: new Date(),
          status: 'ACTIVE',
        },
      });
    }

    return this.findUserPotById(userId, updated.id);
  }

  private computeGlobalStatus(
    device: { lastSeenAt: Date | null },
    latestReading?: { timestamp: Date; soilMoisture?: number; lightLevel?: number } | null,
    plantCare?: { minMoisture?: number | null; maxMoisture?: number | null; minLight?: number | null; maxLight?: number | null } | null,
  ): 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE' {
    const now = Date.now();
    if (!device.lastSeenAt) {
      return 'OFFLINE';
    }
    const lastSeenMs = new Date(device.lastSeenAt).getTime();
    if (now - lastSeenMs > 30 * 60 * 1000) {
      return 'OFFLINE';
    }
    if (!latestReading) {
      // TODO: no measurements yet for this pot; user should check installation / pairing.
      return 'ACTION_REQUIRED';
    }

    const reading = latestReading;
    const soilMoisture = reading.soilMoisture;
    const lightLevel = reading.lightLevel;

    const moistureMin = (plantCare?.minMoisture ?? this.MOISTURE_MIN);
    const moistureMax = (plantCare?.maxMoisture ?? this.MOISTURE_MAX);
    const lightMin = (plantCare?.minLight ?? this.LIGHT_MIN);
    const lightMax = (plantCare?.maxLight ?? this.LIGHT_MAX);

    const evalMetric = (value: number | undefined, min: number, max: number) => {
      if (value === undefined || value === null) return 'missing' as const;
      const range = max - min;
      const margin = range * this.RANGE_TOLERANCE_RATIO;
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

  private computeNextMeasurementIntervalMinutes(
    globalStatus: 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE'
  ): number {
    // TODO: This interval will be used when implementing device scheduling / polling endpoints (backend-driven requests).
    return globalStatus === 'OK' ? 60 : 30;
  }

  private generatePairingCode(): string {
    const n = Math.floor(Math.random() * 1000000);
    return String(n).padStart(6, '0');
  }
}
