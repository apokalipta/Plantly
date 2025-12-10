import { AchievementsEngineService } from '../src/achievements/achievements-engine.service';
import { AchievementEventType } from '../src/achievements/AchievementEventType';

describe('AchievementsEngineService (typed)', () => {
  it('unlocks for DEVICE_PAIRED', async () => {
    const prisma: any = {
      achievement: { findMany: jest.fn().mockResolvedValue([{ id: 1, code: 'FIRST_DEVICE', type: 'first_device_paired' }]) },
      userAchievement: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'ua-1' }),
      },
    };
    const engine = new AchievementsEngineService(prisma);
    const res = await engine.onEvent('user-1', AchievementEventType.DEVICE_PAIRED, { deviceId: 'dev-1' });
    expect(res).toEqual([{ achievementId: 1, unlocked: true }]);
    expect(prisma.userAchievement.create).toHaveBeenCalledWith({ data: { userId: 'user-1', achievementId: 1 } });
  });

  it('prevents duplicate for DEVICE_PAIRED', async () => {
    const prisma: any = {
      achievement: { findMany: jest.fn().mockResolvedValue([{ id: 2, code: 'FIRST_DEVICE', type: 'first_device_paired' }]) },
      userAchievement: {
        findFirst: jest.fn().mockResolvedValue({ id: 'ua-2', userId: 'user-1', achievementId: 2 }),
        create: jest.fn(),
      },
    };
    const engine = new AchievementsEngineService(prisma);
    const res = await engine.onEvent('user-1', AchievementEventType.DEVICE_PAIRED, { deviceId: 'dev-1' });
    expect(res).toEqual([{ achievementId: 2, unlocked: false }]);
    expect(prisma.userAchievement.create).not.toHaveBeenCalled();
  });

  it('filters by SENSOR_READING_RECEIVED', async () => {
    const prisma: any = {
      achievement: { findMany: jest.fn().mockResolvedValue([{ id: 3, code: 'SENSOR', type: 'sensor_activity' }]) },
      userAchievement: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };
    const engine = new AchievementsEngineService(prisma);
    const res = await engine.onEvent('user-1', AchievementEventType.SENSOR_READING_RECEIVED, {
      deviceId: 'dev-1',
      reading: { soilMoisture: 12, timestamp: new Date() },
    });
    expect(res).toEqual([{ achievementId: 3, unlocked: true }]);
    expect(prisma.userAchievement.create).toHaveBeenCalledWith({ data: { userId: 'user-1', achievementId: 3 } });
  });
});

