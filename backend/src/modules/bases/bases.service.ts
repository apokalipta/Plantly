import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AchievementsEngineService } from '../../achievements/achievements-engine.service';
import { AchievementEventType } from '../../achievements/AchievementEventType';
import { PairBaseDto } from './dto/pair-base.dto';
import { PatchSlotsDto, SlotConfigDto } from './dto/patch-slots.dto';
import { PatchPlantDto } from './dto/patch-plant.dto';

@Injectable()
export class BasesService {
  constructor(private readonly prisma: PrismaService, private readonly achievements: AchievementsEngineService) {}

  async pairBaseForUser(userId: string, dto: PairBaseDto): Promise<{ id: string }> {
    const base = await this.prisma.baseDevice.create({
      data: {
        baseUid: dto.pairingCode,
        pairingCode: dto.pairingCode,
        name: dto.name ?? null,
        ownerId: userId,
      },
    });
    for (let i = 1; i <= 4; i++) {
      const slot = await this.prisma.baseSlot.create({
        data: { baseId: base.id, slotIndex: i, potFormat: 'SMALL', isActive: true },
      });
      const virtualUid = `BASE-${base.baseUid}-S${i}`;
      await this.ensureVirtualDevice(base, slot, virtualUid);
    }
    await this.achievements.onEvent(userId, AchievementEventType.DEVICE_PAIRED, {});
    return { id: base.id };
  }

  async listBasesForUser(userId: string): Promise<any[]> {
    const bases = await this.prisma.baseDevice.findMany({ where: { ownerId: userId } });
    const result: any[] = [];
    for (const base of bases) {
      const slots = await this.prisma.baseSlot.findMany({ where: { baseId: base.id }, orderBy: { slotIndex: 'asc' } });
      const enriched = [];
      for (const s of slots) {
        const latest = await this.prisma.sensorReading.findFirst({ where: { baseSlotId: s.id }, orderBy: { timestamp: 'desc' } });
        const plant = s.currentPlantInstanceId ? await this.prisma.plantInstance.findUnique({ where: { id: s.currentPlantInstanceId } }) : null;
        enriched.push({ ...s, latestMeasurement: latest ?? null, plant });
      }
      result.push({ ...base, slots: enriched });
    }
    return result;
  }

  async getBaseDetails(userId: string, baseId: string): Promise<any> {
    const base = await this.prisma.baseDevice.findUnique({ where: { id: baseId } });
    if (!base || base.ownerId !== userId) throw new UnauthorizedException('Forbidden');
    const slots = await this.prisma.baseSlot.findMany({ where: { baseId: base.id }, orderBy: { slotIndex: 'asc' } });
    const detailed = [];
    for (const s of slots) {
      const latest = await this.prisma.sensorReading.findFirst({ where: { baseSlotId: s.id }, orderBy: { timestamp: 'desc' } });
      const plant = s.currentPlantInstanceId ? await this.prisma.plantInstance.findUnique({ where: { id: s.currentPlantInstanceId } }) : null;
      const alerts = await this.prisma.alert.findMany({ where: { baseSlotId: s.id, resolvedAt: null }, orderBy: { createdAt: 'desc' } });
      detailed.push({ ...s, latestMeasurement: latest ?? null, plant, alerts });
    }
    return { ...base, slots: detailed };
  }

  async reconfigureSlots(userId: string, baseId: string, dto: PatchSlotsDto): Promise<void> {
    const base = await this.prisma.baseDevice.findUnique({ where: { id: baseId } });
    if (!base || base.ownerId !== userId) throw new UnauthorizedException('Forbidden');
    const configs = dto.slots;
    this.validateCapacity(configs);
    for (const cfg of configs) {
      await this.prisma.baseSlot.update({
        where: { baseId_slotIndex: { baseId: base.id, slotIndex: cfg.slotIndex } },
        data: { potFormat: cfg.potFormat as any, isActive: cfg.isActive },
      });
    }
  }

  async assignPlantToSlot(userId: string, baseId: string, slotIndex: number, dto: PatchPlantDto): Promise<void> {
    const base = await this.prisma.baseDevice.findUnique({ where: { id: baseId } });
    if (!base || base.ownerId !== userId) throw new UnauthorizedException('Forbidden');
    const slot = await this.prisma.baseSlot.findUnique({ where: { baseId_slotIndex: { baseId: base.id, slotIndex } } });
    if (!slot) throw new NotFoundException('Slot not found');
    const virtualUid = `BASE-${base.baseUid}-S${slot.slotIndex}`;
    const virtual = await this.ensureVirtualDevice(base, slot, virtualUid);
    const prevPlantId = slot.currentPlantInstanceId ?? null;
    if (prevPlantId) {
      const openHist = await this.prisma.slotAssignmentHistory.findFirst({ where: { baseSlotId: slot.id, plantInstanceId: prevPlantId, unassignedAt: null } });
      if (openHist) {
        await this.prisma.slotAssignmentHistory.update({ where: { id: openHist.id }, data: { unassignedAt: new Date() } });
      }
    }
    const plant = await this.prisma.plantInstance.create({
      data: {
        deviceId: virtual.id,
        speciesId: dto.speciesId,
        nickname: dto.nickname ?? null,
        plantedAt: new Date(),
        status: 'ACTIVE',
      },
    });
    await this.prisma.baseSlot.update({ where: { id: slot.id }, data: { currentPlantInstanceId: plant.id } });
    await this.prisma.slotAssignmentHistory.create({
      data: { baseSlotId: slot.id, plantInstanceId: plant.id, assignedAt: new Date() },
    });
    await this.achievements.onEvent(userId, AchievementEventType.PLANT_ADDED, { plantId: plant.id });
  }

  async getSlotMeasurements(userId: string, baseId: string, slotIndex: number, limit: number = 50): Promise<any[]> {
    const base = await this.prisma.baseDevice.findUnique({ where: { id: baseId } });
    if (!base || base.ownerId !== userId) throw new UnauthorizedException('Forbidden');
    const slot = await this.prisma.baseSlot.findUnique({ where: { baseId_slotIndex: { baseId: base.id, slotIndex } } });
    if (!slot) throw new NotFoundException('Slot not found');
    const rows = await this.prisma.sensorReading.findMany({ where: { baseSlotId: slot.id }, orderBy: { timestamp: 'desc' }, take: limit });
    return rows.map((r) => ({
      timestamp: r.timestamp,
      soilMoisture: r.soilMoisture ?? undefined,
      lightLevel: r.lightLevel ?? undefined,
      temperature: r.temperature ?? undefined,
      airHumidity: r.airHumidity ?? undefined,
    }));
  }

  private validateCapacity(configs: SlotConfigDto[]): void {
    const active = configs.filter((c) => c.isActive);
    const hasLarge = active.some((c) => c.potFormat === 'LARGE');
    const hasMedium = active.some((c) => c.potFormat === 'MEDIUM');
    const hasSmall = active.some((c) => c.potFormat === 'SMALL');
    if (hasLarge) {
      if (active.length !== 1 || active[0].potFormat !== 'LARGE') throw new BadRequestException('Invalid LARGE configuration');
    } else if (hasMedium) {
      const set = new Set(active.map((c) => c.slotIndex).sort());
      const validPairs =
        (set.has(1) && set.has(2) && active.filter((c) => c.potFormat === 'MEDIUM' && (c.slotIndex === 1 || c.slotIndex === 2)).length === 2 ? 1 : 0) +
        (set.has(3) && set.has(4) && active.filter((c) => c.potFormat === 'MEDIUM' && (c.slotIndex === 3 || c.slotIndex === 4)).length === 2 ? 1 : 0);
      const totalActive = active.length;
      if (!(validPairs === 1 && totalActive === 2) && !(validPairs === 2 && totalActive === 4)) {
        throw new BadRequestException('Invalid MEDIUM configuration');
      }
    } else {
      if (active.length > 4) throw new BadRequestException('Invalid SMALL configuration');
      if (!active.every((c) => c.potFormat === 'SMALL')) throw new BadRequestException('Invalid SMALL configuration');
    }
  }

  private async ensureVirtualDevice(base: any, slot: any, virtualUid: string) {
    let virtualDevice = await this.prisma.device.findUnique({ where: { deviceUid: virtualUid } });
    if (!virtualDevice) {
      virtualDevice = await this.prisma.device.create({
        data: {
          deviceUid: virtualUid,
          deviceSecret: '',
          ownerId: base.ownerId,
          name: `${base.name ?? 'Base'} Slot ${slot.slotIndex}`,
        },
      });
    }
    return virtualDevice;
  }
}
