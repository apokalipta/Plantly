import { Controller, Get, Param, Query, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { WikiService } from './wiki.service';
import { ListPlantsQueryDto } from './dto/list-plants.query.dto';
import { PlantSpeciesListItemDto } from './dto/plant-species-list-item.dto';
import { PlantSpeciesDetailsDto } from './dto/plant-species-details.dto';
import { ApiTags, ApiOperation, ApiOkResponse, ApiNotFoundResponse } from '@nestjs/swagger';

@ApiTags('wiki')
@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get('plants')
  @ApiOperation({ summary: 'List/search plant species' })
  @ApiOkResponse({ type: PlantSpeciesListItemDto, isArray: true, schema: { example: [ { id: 12, commonName: 'Basilic', latinName: 'Ocimum basilicum', descriptionShort: 'Plante aromatique facile à cultiver.' } ] } })
  async listPlants(@Query() query: ListPlantsQueryDto): Promise<PlantSpeciesListItemDto[]> {
    return this.wikiService.listPlantSpecies(query);
  }

  @Get('plants/:id')
  @ApiOperation({ summary: 'Get plant species details with care info' })
  @ApiOkResponse({ type: PlantSpeciesDetailsDto, schema: { example: { id: 12, commonName: 'Basilic', latinName: 'Ocimum basilicum', descriptionShort: 'Plante aromatique.', imageUrl: 'https://mycdn/plants/basil.jpg', care: { minMoisture: 30, maxMoisture: 70, minLight: 200, maxLight: 1000, wateringIntervalDays: 3, recommendedTemperatureMin: 18, recommendedTemperatureMax: 26, careTips: 'Gardez le sol légèrement humide.' } } } })
  @ApiNotFoundResponse({ description: 'Plant species not found' })
  async getPlant(@Param('id', ParseIntPipe) id: number): Promise<PlantSpeciesDetailsDto> {
    const species = await this.wikiService.getPlantSpeciesById(id);
    if (!species) throw new NotFoundException('Plant species not found');
    return species;
  }
}
