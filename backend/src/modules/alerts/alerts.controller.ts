import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListAlertsQueryDto, AlertDto } from './dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('pots/:potId/alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List alerts for pot' })
  @ApiOkResponse({ type: AlertDto, isArray: true })
  async list(
    @CurrentUser() user: any,
    @Param('potId') potId: string,
    @Query() query: ListAlertsQueryDto,
  ): Promise<AlertDto[]> {
    return this.alertsService.listAlertsForPot(user?.userId, potId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  async resolve(
    @CurrentUser() user: any,
    @Param('id') alertId: string,
  ): Promise<{ status: string }> {
    await this.alertsService.resolveAlert(user?.userId, alertId);
    return { status: 'ok' };
  }
}
