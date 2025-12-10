import { Controller, Get, Put, Body, Post, UseGuards, UploadedFile } from '@nestjs/common';
import { UsersService } from './users.service';
import { MediaService } from '../../media/media.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';
import { AchievementsEngineService } from '../../achievements/achievements-engine.service';
import { AchievementEventType } from '../../achievements/AchievementEventType';
import * as multer from 'multer';
import { PrismaService } from '../../database/prisma.service';
// Intention: Exposer lecture profil et upload avatar avec validations
// Objectif: Enregistrer l’URL d’avatar et déclencher un succès utilisateur
// Logique: Guard JWT, interceptor Multer en mémoire, persistance et évènements

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly achievements: AchievementsEngineService, private readonly media: MediaService, private readonly prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@CurrentUser() user: any): Promise<{ username?: string; avatarUrl?: string | null }> {
    return this.usersService.getProfile(user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto): Promise<{ status: string }> {
    await this.usersService.updateProfile(user?.userId, { username: dto.username });
    return { status: 'ok' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', { storage: multer.memoryStorage() }))
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: any): Promise<{ status: string; url?: string }> {
    const url = await this.media.saveUserAvatar(user?.userId, file);
    await this.usersService.updateProfile(user?.userId, { username: undefined });
    await this.prismaUpdateAvatar(user?.userId, url);
    await this.achievements.onEvent(user?.userId, AchievementEventType.PROFILE_PICTURE_CHANGED);
    return { status: 'ok', url };
  }

  @UseGuards(JwtAuthGuard)
  @Post('user/avatar')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadAvatarSimple(@CurrentUser() user: any, @UploadedFile() file: any): Promise<{ avatarUrl: string }> {
    const url = await this.media.saveUserAvatar(user?.userId, file);
    await this.prismaUpdateAvatar(user?.userId, url);
    return { avatarUrl: url };
  }

  private async prismaUpdateAvatar(userId: string, url: string): Promise<void> {
    await this.usersService.setAvatarUrl(userId, url);
  }
}
