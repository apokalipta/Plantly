import { Controller, Get, Post, Body, NotImplementedException } from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantInstanceDto } from './dto/create-plant-instance.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  @Get()
  async list(): Promise<void> {
    // TODO: list plant instances
    throw new NotImplementedException();
  }

  @Post()
  async create(@Body() _dto: CreatePlantInstanceDto): Promise<void> {
    // TODO: create plant instance
    throw new NotImplementedException();
  }
}

