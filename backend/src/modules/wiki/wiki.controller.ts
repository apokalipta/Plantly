import { Controller, Get, Param, Query, NotFoundException, ParseIntPipe } from '@nestjs/common';
import { WikiService } from './wiki.service';
import { ListPlantsQueryDto } from './dto/list-plants.query.dto';
import { PlantSpeciesListItemDto } from './dto/plant-species-list-item.dto';
import { PlantSpeciesDetailsDto } from './dto/plant-species-details.dto';

@Controller('wiki')
export class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get('plants')
  async listPlants(@Query() query: ListPlantsQueryDto): Promise<PlantSpeciesListItemDto[]> {
    return this.wikiService.listPlantSpecies(query);
  }

  @Get('plants/:id')
  async getPlant(@Param('id', ParseIntPipe) id: number): Promise<PlantSpeciesDetailsDto> {
    const species = await this.wikiService.getPlantSpeciesById(id);
    if (!species) throw new NotFoundException('Plant species not found');
    return species;
  }
}
