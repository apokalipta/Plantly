import { Controller, Get, Put, Body, NotImplementedException } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Controller('user-settings')
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  @Get()
  async getSettings(): Promise<void> {
    // TODO: implement get settings
    throw new NotImplementedException();
  }

  @Put()
  async updateSettings(@Body() _dto: UpdateUserSettingsDto): Promise<void> {
    // TODO: implement update settings
    throw new NotImplementedException();
  }
}

