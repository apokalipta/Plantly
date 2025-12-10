// Module utilisateur: expose contrôleur et service.
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../database/database.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { MediaModule } from '../../media/media.module';

@Module({
  imports: [DatabaseModule, AchievementsModule, MediaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
