import { Injectable } from '@nestjs/common';
import { AchievementStatusDto } from './dto/achievement-status.dto';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserAchievements(userId: string): Promise<AchievementStatusDto[]> {
    const achievements = await this.prisma.achievement.findMany({
      include: {
        userAchievements: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return achievements.map((a: any) => {
      const unlocked = a.userAchievements && a.userAchievements.length > 0;
      const unlockedAt = unlocked ? a.userAchievements[0].unlockedAt : null;
      const dto: AchievementStatusDto = {
        id: a.id,
        code: a.code,
        title: a.title,
        description: a.description,
        category: a.category ?? undefined,
        icon: a.icon ?? undefined,
        unlocked,
        unlockedAt,
      };
      return dto;
    });
  }

  async listAllAchievements(): Promise<AchievementStatusDto[]> {
    const achievements = await this.prisma.achievement.findMany({ orderBy: { createdAt: 'asc' } });
    return achievements.map((a: any) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      description: a.description,
      category: a.category ?? undefined,
      icon: a.icon ?? undefined,
      unlocked: false,
      unlockedAt: null,
    }));
  }
}
