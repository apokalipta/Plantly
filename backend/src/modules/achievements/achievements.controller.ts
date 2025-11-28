import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AchievementStatusDto } from './dto/achievement-status.dto';

@Controller()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me/achievements')
  async getMyAchievements(@CurrentUser() user: any): Promise<AchievementStatusDto[]> {
    return this.achievementsService.getUserAchievements(user?.userId);
  }

  @Get('achievements')
  async listAll(): Promise<AchievementStatusDto[]> {
    return this.achievementsService.listAllAchievements();
  }
}
