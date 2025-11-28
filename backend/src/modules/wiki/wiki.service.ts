import { Injectable } from '@nestjs/common';
import { ListPlantsQueryDto } from './dto/list-plants.query.dto';
import { PlantSpeciesListItemDto } from './dto/plant-species-list-item.dto';
import { PlantSpeciesDetailsDto } from './dto/plant-species-details.dto';

@Injectable()
export class WikiService {
  // TODO: Later: load from separate wiki DB/schema
  // TODO: Later: add full-text search by name

  private readonly data: PlantSpeciesDetailsDto[] = [
    {
      id: 1,
      commonName: 'Snake Plant',
      latinName: 'Sansevieria trifasciata',
      descriptionShort: 'Hardy, low-light tolerant plant.',
      imageUrl: 'https://example.com/snake-plant.jpg',
      care: {
        minMoisture: 20,
        maxMoisture: 40,
        minLight: 100,
        maxLight: 1000,
        wateringIntervalDays: 14,
        recommendedTemperatureMin: 15,
        recommendedTemperatureMax: 30,
        careTips: 'Allow soil to dry between waterings.'
      }
    },
    {
      id: 2,
      commonName: 'Peace Lily',
      latinName: 'Spathiphyllum',
      descriptionShort: 'Popular indoor plant with white blooms.',
      imageUrl: 'https://example.com/peace-lily.jpg',
      care: {
        minMoisture: 40,
        maxMoisture: 70,
        minLight: 200,
        maxLight: 800,
        wateringIntervalDays: 7,
        recommendedTemperatureMin: 18,
        recommendedTemperatureMax: 27,
        careTips: 'Keep soil evenly moist; avoid direct sun.'
      }
    }
  ];

  async listPlantSpecies(query: ListPlantsQueryDto): Promise<PlantSpeciesListItemDto[]> {
    const search = (query.search || '').toLowerCase();
    const items = this.data
      .filter(s => !search || s.commonName.toLowerCase().includes(search) || (s.latinName || '').toLowerCase().includes(search))
      .map<PlantSpeciesListItemDto>(s => ({
        id: s.id,
        commonName: s.commonName,
        latinName: s.latinName,
        descriptionShort: s.descriptionShort,
      }));
    return items;
  }

  async getPlantSpeciesById(id: number): Promise<PlantSpeciesDetailsDto | null> {
    const found = this.data.find(s => s.id === id) || null;
    return found;
  }
}
