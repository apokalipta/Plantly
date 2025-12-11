import { Controller, Post, Param, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from '../../media/media.service';
import { AdminGuard } from '../../common/guards';

interface PlantSpeciesCodeShape {
  id: number;
  commonName: string;
  code?: string | null;
}

interface PlantDtoResponse {
  id: number;
  commonName: string;
  code?: string | null;
  imageUrl?: string | null;
}

@Controller('admin/plants')
export class AdminPlantsController {
  constructor(private readonly prisma: PrismaService, private readonly media: MediaService) {}

  @Post(':id/image')
  @UseGuards(AdminGuard as any)
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadPlantImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<PlantDtoResponse> {
    if (!file) throw new BadRequestException('File required');
    const plant = await this.prisma.plantSpecies.findUnique({ where: { id: Number(id) } });
    if (!plant) throw new BadRequestException('Plant species not found');
    const sp = plant as unknown as PlantSpeciesCodeShape;
    const code = sp.code || this.slugify(sp.commonName) || `species-${sp.id}`;
    const url = await this.media.savePlantMainImage(code, file);
    const updated = await this.prisma.plantSpecies.update({ where: { id: sp.id }, data: { imageUrl: url } });
    const out: PlantDtoResponse = { id: updated.id, commonName: sp.commonName, code: sp.code ?? code, imageUrl: url };
    return out;
  }

  private slugify(input: string | null): string {
    const s = (input || '').toLowerCase();
    return s.replaceAll(/[^a-z0-9\s-]/g, '').trim().replaceAll(/\s+/g, '-');
  }
}
