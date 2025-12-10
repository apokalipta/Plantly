// Service wiki: recherche et détails des espèces (avec infos de soin).
import { Injectable, NotFoundException } from '@nestjs/common';
import { ListPlantsQueryDto } from './dto/list-plants.query.dto';
import { PlantSpeciesListItemDto } from './dto/plant-species-list-item.dto';
import { PlantSpeciesDetailsDto } from './dto/plant-species-details.dto';
import { PrismaService } from '../../database/prisma.service';
 

@Injectable()
export class WikiService {
  constructor(private readonly prisma: PrismaService) {}

  async listPlantSpecies(query: ListPlantsQueryDto): Promise<PlantSpeciesListItemDto[]> {
    // Prépare le filtre de recherche
    const search = query.search?.trim();
    const where = search
      ? {
          OR: [
            { commonName: { contains: search, mode: 'insensitive' as const } },
            { latinName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;
    // Interroge la base puis mappe vers DTO liste
    const rows = await this.prisma.plantSpecies.findMany({ where, orderBy: { commonName: 'asc' } });
    return rows.map((s: any) => ({
      id: s.id,
      commonName: s.commonName,
      latinName: s.latinName ?? undefined,
      descriptionShort: s.descriptionShort ?? undefined,
      code: s.code ?? undefined,
      imageUrl: s.imageUrl ?? undefined,
    }));
  }

  async getPlantSpeciesById(id: number): Promise<PlantSpeciesDetailsDto> {
    // Récupère l'espèce et ses infos de soin
    const s = await this.prisma.plantSpecies.findUnique({
      where: { id },
      include: { care: true },
    });
    if (!s) throw new NotFoundException('Plant species not found');
    // Mappe vers DTO détaillé
    const sp: any = s as any;
    return {
      id: sp.id,
      commonName: sp.commonName,
      latinName: sp.latinName ?? undefined,
      descriptionShort: sp.descriptionShort ?? undefined,
      imageUrl: sp.imageUrl ?? undefined,
      code: sp.code ?? undefined,
      care: sp.care
        ? {
            minMoisture: sp.care.minMoisture ?? undefined,
            maxMoisture: sp.care.maxMoisture ?? undefined,
            minLight: sp.care.minLight ?? undefined,
            maxLight: sp.care.maxLight ?? undefined,
            wateringIntervalDays: sp.care.wateringIntervalDays ?? undefined,
            recommendedTemperatureMin: sp.care.recommendedTemperatureMin ?? undefined,
            recommendedTemperatureMax: sp.care.recommendedTemperatureMax ?? undefined,
            careTips: sp.care.careTips ?? undefined,
          }
        : {},
    };
  }
}
