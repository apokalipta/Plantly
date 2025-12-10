// Contrôleur des plantes: endpoints pour lister et créer des instances (à implémenter).
import { Controller, Get, Post, Body, NotImplementedException } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantInstanceDto } from './dto/create-plant-instance.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  // Liste des instances de plantes
  @Get()
  async list(): Promise<void> {
    // TODO: list plant instances
    throw new NotImplementedException();
  }

  // Crée une instance de plante
  @Post()
  async create(@Body() _dto: CreatePlantInstanceDto): Promise<void> {
    // TODO: create plant instance
    throw new NotImplementedException();
  }
}

