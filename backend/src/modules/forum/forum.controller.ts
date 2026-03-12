import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { MediaService } from '../../media/media.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateDiscussionDto } from './dto/create-discussion.dto';
import { ForumService } from './forum.service';

@Controller('forum')
export class ForumController {
  constructor(private readonly forum: ForumService, private readonly media: MediaService) {}

  @Get()
  async list() {
    return this.forum.listDiscussions();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateDiscussionDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    const userId = user?.userId;
    if (!userId) throw new BadRequestException('Unauthorized');
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.media.saveForumImage(file);
    }
    return this.forum.createDiscussion({ authorId: userId, title: dto.title, content: dto.content, imageUrl });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  async addComment(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: CreateCommentDto) {
    const userId = user?.userId;
    if (!userId) throw new BadRequestException('Unauthorized');
    return this.forum.addCommentAndNotify({ discussionId: id, authorId: userId, content: dto.content });
  }
}

