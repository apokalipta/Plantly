export class AchievementStatusDto {
  id!: number;
  code!: string;
  title!: string;
  description!: string;
  category?: string;
  icon?: string;
  unlocked!: boolean;
  unlockedAt?: Date | null;
}

