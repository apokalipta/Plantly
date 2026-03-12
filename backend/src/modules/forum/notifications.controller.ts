import { BadRequestException, Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForumService } from './forum.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly forum: ForumService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@CurrentUser() user: any) {
    const userId = user?.userId;
    if (!userId) throw new BadRequestException('Unauthorized');
    return this.forum.listNotifications(userId);
  }
}

