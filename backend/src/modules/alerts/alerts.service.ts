import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AlertDto, ListAlertsQueryDto } from './dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async listAlertsForPot(userId: string, potId: string, query: ListAlertsQueryDto): Promise<AlertDto[]> {
    const device = await this.prisma.device.findFirst({ where: { id: potId, ownerId: userId } });
    if (!device) {
      throw new UnauthorizedException('Pot not found');
    }
    const where = { deviceId: device.id, resolvedAt: query.onlyUnresolved ? null : undefined } as any;
    const rows = await this.prisma.alert.findMany({ where, orderBy: { createdAt: 'desc' } });
    return rows.map((a: any) => ({
      id: a.id,
      deviceId: a.deviceId,
      plantInstanceId: a.plantInstanceId ?? undefined,
      type: String(a.type),
      severity: String(a.severity),
      createdAt: a.createdAt,
      resolvedAt: a.resolvedAt ?? undefined,
    }));
  }

  async resolveAlert(userId: string, alertId: string): Promise<void> {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException('Alert not found');
    }
    const device = await this.prisma.device.findUnique({ where: { id: alert.deviceId } });
    if (!device || device.ownerId !== userId) {
      throw new UnauthorizedException('Forbidden');
    }
    await this.prisma.alert.update({ where: { id: alertId }, data: { resolvedAt: new Date() } });
  }

  async createOrUpdate(
    deviceId: string,
    plantInstanceId: string | null,
    type: 'WATER_NEEDED' | 'LIGHT_TOO_LOW' | 'LIGHT_TOO_HIGH' | 'BATTERY_LOW' | 'OFFLINE' | 'OTHER',
    severity: 'INFO' | 'WARNING' | 'CRITICAL',
  ): Promise<void> {
    const existing = await this.prisma.alert.findFirst({ where: { deviceId, type, resolvedAt: null } });
    if (existing) {
      const level = { INFO: 1, WARNING: 2, CRITICAL: 3 } as const;
      if (level[severity] > level[String(existing.severity) as keyof typeof level]) {
        await this.prisma.alert.update({ where: { id: existing.id }, data: { severity } });
      }
      return;
    }
    await this.prisma.alert.create({
      data: {
        deviceId,
        plantInstanceId,
        type,
        severity,
      },
    });
  }

  async resolveAllForDevice(deviceId: string): Promise<void> {
    await this.prisma.alert.updateMany({ where: { deviceId, resolvedAt: null }, data: { resolvedAt: new Date() } });
  }
}
