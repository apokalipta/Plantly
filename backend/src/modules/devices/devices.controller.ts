import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListPotsResponseDto } from './dto/list-pots.response.dto';
import { LinkPotDto } from './dto/link-pot.dto';
import { PotDetailsResponseDto } from './dto/pot-details.response.dto';

@Controller('pots')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async list(@CurrentUser() user: any): Promise<ListPotsResponseDto[]> {
    return this.devicesService.findUserPots(user?.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async details(@CurrentUser() user: any, @Param('id') potId: string): Promise<PotDetailsResponseDto> {
    return this.devicesService.findUserPotById(user?.userId, potId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link')
  async link(@CurrentUser() user: any, @Body() dto: LinkPotDto): Promise<PotDetailsResponseDto> {
    return this.devicesService.linkPotToUser(user?.userId, dto);
  }
}
