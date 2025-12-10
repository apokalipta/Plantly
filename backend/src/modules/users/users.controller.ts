// Contrôleur utilisateur: profil courant (lecture/mise à jour, à implémenter).
import { Controller, Get, Put, Body, NotImplementedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Récupère le profil
  @Get('me')
  async getProfile(): Promise<void> {
    // TODO: implement get profile
    throw new NotImplementedException();
  }

  // Met à jour le profil
  @Put('me')
  async updateProfile(@Body() _dto: UpdateProfileDto): Promise<void> {
    // TODO: implement update profile
    throw new NotImplementedException();
  }
}

