import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AchievementStatusDto } from './dto/achievement-status.dto';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('achievements')
@ApiBearerAuth()
@Controller()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/achievements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List achievements with user unlock status' })
  @ApiOkResponse({ type: AchievementStatusDto, isArray: true, schema: { example: [ { id: 1, code: 'FIRST_PLANT', title: 'Première plante', description: 'Vous avez ajouté votre première plante.', category: 'general', icon: 'leaf', unlocked: true, unlockedAt: '2024-12-15T10:00:00Z' }, { id: 2, code: 'PERFECT_WEEK', title: 'Semaine parfaite', description: 'Tous les indicateurs sont restés dans le vert pendant 7 jours.', category: 'care', icon: 'sun', unlocked: false, unlockedAt: null } ] } })
  async getMyAchievements(@CurrentUser() user: any): Promise<AchievementStatusDto[]> {
    return this.achievementsService.getUserAchievements(user?.userId);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'List all achievement definitions' })
  @ApiOkResponse({ type: AchievementStatusDto, isArray: true, schema: { example: [ { id: 1, code: 'FIRST_PLANT', title: 'Première plante', description: 'Vous avez ajouté votre première plante.', category: 'general', icon: 'leaf', unlocked: false, unlockedAt: null } ] } })
  async listAll(): Promise<AchievementStatusDto[]> {
    return this.achievementsService.listAllAchievements();
  }
}
