import { AdminPlantsController } from '../src/modules/wiki/admin-plants.controller';
import { MediaService } from '../src/media/media.service';
import { PrismaService } from '../src/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { describe, it, expect, jest } from '@jest/globals';

const makeFile = (mime: string, size: number) => ({
  fieldname: 'file', originalname: 'a', encoding: '7bit', mimetype: mime, size, buffer: Buffer.alloc(size || 1),
} as any);

describe('AdminPlantsController', () => {
  it('uploads image and updates PlantSpecies.imageUrl', async () => {
    const prisma: any = {
      plantSpecies: {
        findUnique: (jest.fn() as any).mockResolvedValue({ id: 1, commonName: 'Basil', code: 'basil' } as any),
        update: (jest.fn() as any).mockResolvedValue({ id: 1, imageUrl: 'http://localhost:3000/media/public/plants/basil/main.webp' } as any),
      },
    };
    const media: any = { savePlantMainImage: (jest.fn() as any).mockResolvedValue('http://localhost:3000/media/public/plants/basil/main.webp' as any) };
    const ctrl = new AdminPlantsController(prisma, media);
    const res = await ctrl.uploadPlantImage('1', makeFile('image/webp', 1000));
    expect(res.imageUrl).toBe('http://localhost:3000/media/public/plants/basil/main.webp');
  });

  it('throws when plant not found', async () => {
    const prisma: any = { plantSpecies: { findUnique: (jest.fn() as any).mockResolvedValue(null as any) } };
    const media: any = {};
    const ctrl = new AdminPlantsController(prisma, media);
    await expect(ctrl.uploadPlantImage('1', makeFile('image/webp', 1000))).rejects.toBeInstanceOf(BadRequestException);
  });
});
