import { Injectable, NotFoundException } from '@nestjs/common';
import { ListPlantsQueryDto } from './dto/list-plants.query.dto';
import { PlantSpeciesListItemDto } from './dto/plant-species-list-item.dto';
import { PlantSpeciesDetailsDto } from './dto/plant-species-details.dto';
import { PrismaService } from '../../database/prisma.service';
 

@Injectable()
export class WikiService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlantSpecies(query: ListPlantsQueryDto): Promise<PlantSpeciesListItemDto[]> {
    const search = query.search?.trim();
    const where = search
      ? {
          OR: [
            { commonName: { contains: search, mode: 'insensitive' as const } },
            { latinName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;
    const rows = await this.prisma.plantSpecies.findMany({ where, orderBy: { commonName: 'asc' } });
    return rows.map((s: any) => ({
      id: s.id,
      commonName: s.commonName,
      latinName: s.latinName ?? undefined,
      descriptionShort: s.descriptionShort ?? undefined,
    }));
  }

  async getPlantSpeciesById(id: number): Promise<PlantSpeciesDetailsDto> {
    const s = await this.prisma.plantSpecies.findUnique({
      where: { id },
      include: { care: true },
    });
    if (!s) throw new NotFoundException('Plant species not found');
    return {
      id: s.id,
      commonName: s.commonName,
      latinName: s.latinName ?? undefined,
      descriptionShort: s.descriptionShort ?? undefined,
      imageUrl: s.imageUrl ?? undefined,
      care: s.care
        ? {
            minMoisture: s.care.minMoisture ?? undefined,
            maxMoisture: s.care.maxMoisture ?? undefined,
            minLight: s.care.minLight ?? undefined,
            maxLight: s.care.maxLight ?? undefined,
            wateringIntervalDays: s.care.wateringIntervalDays ?? undefined,
            recommendedTemperatureMin: s.care.recommendedTemperatureMin ?? undefined,
            recommendedTemperatureMax: s.care.recommendedTemperatureMax ?? undefined,
            careTips: s.care.careTips ?? undefined,
          }
        : {},
    };
  }
}
