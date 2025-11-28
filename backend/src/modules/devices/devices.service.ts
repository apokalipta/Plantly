import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ListPotsResponseDto } from './dto/list-pots.response.dto';
import { PotDetailsResponseDto } from './dto/pot-details.response.dto';
import { LinkPotDto } from './dto/link-pot.dto';
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
        const globalStatus = this.computeGlobalStatus(d as any, latest as any);
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

    const globalStatus = this.computeGlobalStatus(device as any, latest as any);
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

  async linkPotToUser(userId: string, dto: LinkPotDto): Promise<PotDetailsResponseDto> {
    const device = await this.prisma.device.findUnique({ where: { deviceUid: dto.deviceUid } });
    if (!device) {
      // TODO: In real setup, devices are pre-provisioned and pairingCode validated
      throw new NotFoundException('Device not found for provided UID');
    }
    if (device.ownerId && device.ownerId !== userId) {
      throw new BadRequestException('Device already linked to another user');
    }
    // TODO: validate pairingCode properly
    const updated = await this.prisma.device.update({
      where: { id: device.id },
      data: {
        ownerId: userId,
        name: dto.name ?? device.name,
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
          userId: userId,
        },
      });
    }

    return this.findUserPotById(userId, updated.id);
  }

  private computeGlobalStatus(
    device: { lastSeenAt: Date | null },
    latestReading?: { timestamp: Date } | null,
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

    const reading: any = latestReading;
    const soilMoisture: number | undefined = reading.soilMoisture;
    const lightLevel: number | undefined = reading.lightLevel;

    // If any critical value missing, be cautious.
    if (soilMoisture === undefined || lightLevel === undefined) {
      return 'ACTION_REQUIRED';
    }

    // Generic ranges with tolerance. TODO: Replace with species-based thresholds from wiki using PlantInstance.speciesId
    const moistureRange = this.MOISTURE_MAX - this.MOISTURE_MIN;
    const lightRange = this.LIGHT_MAX - this.LIGHT_MIN;
    const moistureMinTol = this.MOISTURE_MIN - moistureRange * this.RANGE_TOLERANCE_RATIO;
    const moistureMaxTol = this.MOISTURE_MAX + moistureRange * this.RANGE_TOLERANCE_RATIO;
    const lightMinTol = this.LIGHT_MIN - lightRange * this.RANGE_TOLERANCE_RATIO;
    const lightMaxTol = this.LIGHT_MAX + lightRange * this.RANGE_TOLERANCE_RATIO;

    const moistureWithin = soilMoisture >= this.MOISTURE_MIN && soilMoisture <= this.MOISTURE_MAX;
    const lightWithin = lightLevel >= this.LIGHT_MIN && lightLevel <= this.LIGHT_MAX;

    const moistureSlight = !moistureWithin && soilMoisture >= moistureMinTol && soilMoisture <= moistureMaxTol;
    const lightSlight = !lightWithin && lightLevel >= lightMinTol && lightLevel <= lightMaxTol;

    const moistureFar = !moistureWithin && !moistureSlight;
    const lightFar = !lightWithin && !lightSlight;

    if (moistureWithin && lightWithin) {
      return 'OK';
    }
    if (moistureFar || lightFar) {
      return 'BAD';
    }
    return 'ACTION_REQUIRED';
  }

  private computeNextMeasurementIntervalMinutes(
    globalStatus: 'OK' | 'ACTION_REQUIRED' | 'BAD' | 'OFFLINE'
  ): number {
    // TODO: This interval will be used when implementing device scheduling / polling endpoints (backend-driven requests).
    return globalStatus === 'OK' ? 60 : 30;
  }
}
