// Contrôleur alertes: liste et résolution, protégé par JWT.
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ListAlertsQueryDto, AlertDto } from './dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
// Intention: Exposer les endpoints REST pour lister et résoudre les alertes d’un pot
// Objectif: Restreindre l’accès via JWT et retourner des DTO cohérents
// Logique: Vérification de l’utilisateur courant et délégation au service d’alertes

// Doc Swagger + Bearer
@ApiTags('alerts')
@ApiBearerAuth()
// Route base /pots/:potId/alerts
@Controller('pots/:potId/alerts')
export class AlertsController {
  // Injection service
  constructor(private readonly alertsService: AlertsService) {}

  // Liste des alertes du pot
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List alerts for pot' })
  @ApiOkResponse({ type: AlertDto, isArray: true })
  async list(
    @CurrentUser() user: any,
    @Param('potId') potId: string,
    @Query() query: ListAlertsQueryDto,
  ): Promise<AlertDto[]> {
    // Appel service
    return this.alertsService.listAlertsForPot(user?.userId, potId, query);
  }

  // Résoudre une alerte
  @UseGuards(JwtAuthGuard)
  @Patch('/alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve an alert' })
  async resolve(
    @CurrentUser() user: any,
    @Param('id') alertId: string,
  ): Promise<{ status: string }> {
    // Appel service
    await this.alertsService.resolveAlert(user?.userId, alertId);
    return { status: 'ok' };
  }
}
