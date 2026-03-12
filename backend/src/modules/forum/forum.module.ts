import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { MediaModule } from '../../media/media.module';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { NotificationsController } from './notifications.controller';

@Module({
  imports: [DatabaseModule, MediaModule],
  controllers: [ForumController, NotificationsController],
  providers: [ForumService],
})
export class ForumModule {}

