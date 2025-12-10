const { AchievementsEngineService } = require('../../../dist/achievements/achievements-engine.service.js');
const { AchievementEventType } = require('../../../dist/achievements/AchievementEventType.js');

describe('AchievementsEngineService', () => {
  test('unlocks on DEVICE_PAIRED for matching type', async () => {
    const prisma = {
      achievement: { findMany: jest.fn().mockResolvedValue([{ id: 1, code: 'FIRST_DEVICE', type: 'first_device_paired' }]) },
      userAchievement: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'ua-1', userId: 'u1', achievementId: 1 }),
      },
    };
    const engine = new AchievementsEngineService(prisma);
    const res = await engine.onEvent('u1', AchievementEventType.DEVICE_PAIRED, { deviceId: 'd1' });
    expect(res).toEqual([{ achievementId: 1, unlocked: true }]);
    expect(prisma.userAchievement.create).toHaveBeenCalledWith({ data: { userId: 'u1', achievementId: 1 } });
  });

  test('prevents duplicate unlock', async () => {
    const prisma = {
      achievement: { findMany: jest.fn().mockResolvedValue([{ id: 2, code: 'FIRST_DEVICE', type: 'first_device_paired' }]) },
      userAchievement: {
        findFirst: jest.fn().mockResolvedValue({ id: 'ua-2', userId: 'u1', achievementId: 2 }),
        create: jest.fn(),
      },
    };
    const engine = new AchievementsEngineService(prisma);
    const res = await engine.onEvent('u1', AchievementEventType.DEVICE_PAIRED, { deviceId: 'd1' });
    expect(res).toEqual([{ achievementId: 2, unlocked: false }]);
    expect(prisma.userAchievement.create).not.toHaveBeenCalled();
  });

  test('filters by event type sensor', async () => {
    const prisma = {
      achievement: {
        findMany: jest.fn().mockResolvedValue([
          { id: 3, code: 'SENSOR1', type: 'sensor_activity' },
          { id: 4, code: 'PROFILE', type: 'profile_picture' },
        ]),
      },
      userAchievement: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };
    const engine = new AchievementsEngineService(prisma);
    const res = await engine.onEvent('u1', AchievementEventType.SENSOR_READING_RECEIVED, {
      deviceId: 'd1',
      reading: { soilMoisture: 10, timestamp: new Date() },
    });
    expect(res).toEqual([{ achievementId: 3, unlocked: true }]);
    expect(prisma.userAchievement.create).toHaveBeenCalledWith({ data: { userId: 'u1', achievementId: 3 } });
  });
});

