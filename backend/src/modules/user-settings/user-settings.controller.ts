// Contrôleur paramètres utilisateur: lecture et mise à jour des préférences (à implémenter).
import { Controller, Get, Put, Body, NotImplementedException } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  // Récupère les paramètres
  @Get()
  async getSettings(): Promise<void> {
    // TODO: implement get settings
    throw new NotImplementedException();
  }

  // Met à jour les paramètres
  @Put()
  async updateSettings(@Body() _dto: UpdateUserSettingsDto): Promise<void> {
    // TODO: implement update settings
    throw new NotImplementedException();
  }
}

