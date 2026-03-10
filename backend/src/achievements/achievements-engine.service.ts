import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AchievementEventType } from './AchievementEventType';
// Intention: Orchestrer l’attribution des succès en fonction des événements
// Objectif: Charger les définitions, filtrer par type d’événement et éviter les doublons
// Logique: Map définitions -> règles, puis enregistrement idempotent côté base

export interface AchievementDefinition {
  id: number;
  code: string;
  type: string;
}

export interface EventPayload {
  deviceId?: string;
  plantId?: string;
  reading?: {
    soilMoisture?: number;
    lightLevel?: number;
    temperature?: number;
    airHumidity?: number;
    timestamp?: Date;
  };
}

export interface UnlockResult {
  achievementId: number;
  unlocked: boolean;
}

@Injectable()
export class AchievementsEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async onEvent(userId: string, eventType: AchievementEventType, payload?: EventPayload): Promise<UnlockResult[]> {
    if (!userId) return [];
    const defs = await this.loadAllDefinitions();
    const targets = this.filterByEventType(defs, eventType);
    const results: UnlockResult[] = [];
    for (const a of targets) {
      const shouldUnlock = await this.evaluateConditions(userId, eventType, a, payload);
      if (!shouldUnlock) {
        results.push({ achievementId: a.id, unlocked: false });
        continue;
      }
      const done = await this.ensureUnlocked(userId, a.id);
      results.push({ achievementId: a.id, unlocked: done });
    }
    return results;
  }

  private async loadAllDefinitions(): Promise<AchievementDefinition[]> {
    const rows = await this.prisma.achievement.findMany();
    return (rows as any[]).map((a) => ({ id: a.id, code: a.code, type: String((a as any).type || '') }));
  }

  private filterByEventType(defs: AchievementDefinition[], eventType: AchievementEventType): AchievementDefinition[] {
    if (eventType === AchievementEventType.DEVICE_PAIRED) {
      return defs.filter((d) => d.type === 'first_device_paired');
    }
    if (eventType === AchievementEventType.PLANT_ADDED || eventType === AchievementEventType.PLANT_CHANGED) {
      return defs.filter((d) => d.type === 'plant_management');
    }
    if (eventType === AchievementEventType.SENSOR_READING_RECEIVED) {
      return defs.filter((d) => d.type === 'sensor_activity');
    }
    if (eventType === AchievementEventType.PROFILE_PICTURE_CHANGED) {
      return defs.filter((d) => d.type === 'profile_picture');
    }
    return [];
  }

  private async ensureUnlocked(userId: string, achievementId: number): Promise<boolean> {
    const existing = await this.prisma.userAchievement.findFirst({ where: { userId, achievementId } });
    if (existing) return false;
    await this.prisma.userAchievement.create({ data: { userId, achievementId } });
    return true;
  }

  private async evaluateConditions(
    userId: string,
    eventType: AchievementEventType,
    def: AchievementDefinition,
    payload?: EventPayload,
  ): Promise<boolean> {
    if (eventType === AchievementEventType.DEVICE_PAIRED) {
      return true;
    }
    if (eventType === AchievementEventType.PLANT_ADDED || eventType === AchievementEventType.PLANT_CHANGED) {
      return !!payload?.plantId;
    }
    if (eventType === AchievementEventType.SENSOR_READING_RECEIVED) {
      return !!payload?.deviceId && !!payload?.reading;
    }
    if (eventType === AchievementEventType.PROFILE_PICTURE_CHANGED) {
      return true;
    }
    return false;
  }
}

