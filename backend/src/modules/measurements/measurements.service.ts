// Service des mesures: récupère les relevés capteurs pour un pot.
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetMeasurementsQueryDto } from './dto/get-measurements.query.dto';
import { MeasurementDto } from './dto/measurement.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MeasurementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMeasurementsForPot(userId: string, potId: string, query: GetMeasurementsQueryDto): Promise<MeasurementDto[]> {
    // Vérifie possession du pot
    const device = await this.prisma.device.findFirst({ where: { id: potId, ownerId: userId } });
    if (!device) {
      throw new NotFoundException('Pot not found');
    }
    // Construit le filtre temporel et limite
    const where: any = { deviceId: potId };
    if (query.from) {
      where.timestamp = { ...(where.timestamp || {}), gte: new Date(query.from) };
    }
    if (query.to) {
      where.timestamp = { ...(where.timestamp || {}), lte: new Date(query.to) };
    }
    const limit = query.limit ?? 100; // TODO: move to config/defaults
    // Récupère et mappe les mesures
    const readings = await this.prisma.sensorReading.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return readings.map((r: any) => ({
      timestamp: r.timestamp,
      soilMoisture: r.soilMoisture ?? undefined,
      lightLevel: r.lightLevel ?? undefined,
      temperature: r.temperature ?? undefined,
    }));
  }

  async getLatestMeasurementForPot(userId: string, potId: string): Promise<MeasurementDto | null> {
    // Vérifie possession du pot
    const device = await this.prisma.device.findFirst({ where: { id: potId, ownerId: userId } });
    if (!device) {
      throw new NotFoundException('Pot not found');
    }
    // Récupère le dernier relevé
    const latest = await this.prisma.sensorReading.findFirst({
      where: { deviceId: potId },
      orderBy: { timestamp: 'desc' },
    });
    if (!latest) return null;
    // Mappe vers DTO
    return {
      timestamp: latest.timestamp,
      soilMoisture: latest.soilMoisture ?? undefined,
      lightLevel: latest.lightLevel ?? undefined,
      temperature: latest.temperature ?? undefined,
    };
  }
}
