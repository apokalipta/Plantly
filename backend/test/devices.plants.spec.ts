import { describe, it, expect, jest } from '@jest/globals';
import { DevicesService } from '../src/modules/devices/devices.service';

const makePrisma = () =>
  ({
    device: {
      findFirst: jest.fn(),
    },
    plantInstance: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  } as any);

describe('DevicesService plant assignment', () => {
  it('creates a plant instance and triggers PLANT_ADDED when none existed', async () => {
    const prisma = makePrisma();
    prisma.device.findFirst.mockResolvedValue({ id: 'pot-1', ownerId: 'user-1' });
    prisma.plantInstance.findFirst.mockResolvedValue(null);
    prisma.plantInstance.create.mockResolvedValue({ id: 'plant-1' });
    const achievements = { onEvent: jest.fn() } as any;

    const svc = new DevicesService(prisma, achievements);
    await svc.assignPlantToPot('user-1', 'pot-1', { speciesId: 12, nickname: 'Basilou' });

    expect(prisma.plantInstance.updateMany).not.toHaveBeenCalled();
    expect(prisma.plantInstance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deviceId: 'pot-1',
          speciesId: 12,
          nickname: 'Basilou',
          status: 'ACTIVE',
        }),
      }),
    );
    expect(achievements.onEvent).toHaveBeenCalledWith('user-1', 'PLANT_ADDED', { plantId: 'plant-1' });
  });

  it('marks previous ACTIVE plants as REMOVED and triggers PLANT_CHANGED', async () => {
    const prisma = makePrisma();
    prisma.device.findFirst.mockResolvedValue({ id: 'pot-1', ownerId: 'user-1' });
    prisma.plantInstance.findFirst.mockResolvedValue({ id: 'plant-old' });
    prisma.plantInstance.create.mockResolvedValue({ id: 'plant-new' });
    const achievements = { onEvent: jest.fn() } as any;

    const svc = new DevicesService(prisma, achievements);
    await svc.assignPlantToPot('user-1', 'pot-1', { speciesId: 7 });

    expect(prisma.plantInstance.updateMany).toHaveBeenCalledWith({
      where: { deviceId: 'pot-1', status: 'ACTIVE' },
      data: { status: 'REMOVED' },
    });
    expect(achievements.onEvent).toHaveBeenCalledWith('user-1', 'PLANT_CHANGED', { plantId: 'plant-new' });
  });

  it('removePlantFromPot marks ACTIVE plants as REMOVED', async () => {
    const prisma = makePrisma();
    prisma.device.findFirst.mockResolvedValue({ id: 'pot-1', ownerId: 'user-1' });
    const achievements = { onEvent: jest.fn() } as any;

    const svc = new DevicesService(prisma, achievements);
    await svc.removePlantFromPot('user-1', 'pot-1');

    expect(prisma.plantInstance.updateMany).toHaveBeenCalledWith({
      where: { deviceId: 'pot-1', status: 'ACTIVE' },
      data: { status: 'REMOVED' },
    });
  });
});

