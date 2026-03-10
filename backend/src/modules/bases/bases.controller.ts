import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { BasesService } from './bases.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PairBaseDto } from './dto/pair-base.dto';
import { PatchSlotsDto } from './dto/patch-slots.dto';
import { PatchPlantDto } from './dto/patch-plant.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('bases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bases')
export class BasesController {
  constructor(private readonly service: BasesService) {}

  @Post('pair')
  @ApiOperation({ summary: 'Pair a base device to the current user and initialize slots' })
  @ApiBody({ type: PairBaseDto })
  @ApiOkResponse({ schema: { example: { id: 'base-id' } } })
  async pair(@CurrentUser() user: any, @Body() dto: PairBaseDto) {
    return this.service.pairBaseForUser(String(user.userId), dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bases with slots, current plant and latest readings' })
  async list(@CurrentUser() user: any) {
    return this.service.listBasesForUser(String(user.userId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get base details including slots, current plant, latest readings and alerts' })
  async details(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getBaseDetails(String(user.userId), id);
  }

  @Patch(':id/slots')
  @ApiOperation({ summary: 'Reconfigure slots formats and activation with capacity rules' })
  @ApiBody({ type: PatchSlotsDto })
  async patchSlots(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: PatchSlotsDto) {
    await this.service.reconfigureSlots(String(user.userId), id, dto);
    return { status: 'ok' };
  }

  @Patch(':id/slots/:slotIndex/plant')
  @ApiOperation({ summary: 'Assign or change the plant in a slot' })
  @ApiBody({ type: PatchPlantDto })
  async patchPlant(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('slotIndex') slotIndex: string,
    @Body() dto: PatchPlantDto,
  ) {
    await this.service.assignPlantToSlot(String(user.userId), id, Number(slotIndex), dto);
    return { status: 'ok' };
  }

  @Get(':id/slots/:slotIndex/measurements')
  @ApiOperation({ summary: 'Get latest measurements for a slot' })
  async getMeasurements(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('slotIndex') slotIndex: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? Number(limit) : 50;
    return this.service.getSlotMeasurements(String(user.userId), id, Number(slotIndex), lim);
  }
}
