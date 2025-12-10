// Contrôleur succès: endpoints pour statut utilisateur et définitions.
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AchievementStatusDto } from './dto/achievement-status.dto';
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
// Intention: Endpoints pour consulter les succès (utilisateur et catalogue)
// Objectif: Protéger l’accès utilisateur et rendre un format homogène
// Logique: Guard JWT sur /me, route publique pour catalogue

// Doc Swagger (tag)
@ApiTags('achievements')
// Auth Bearer (JWT)
@ApiBearerAuth()
// Contrôleur sans préfixe
@Controller()
export class AchievementsController {
  // Injection du service
  constructor(private readonly achievementsService: AchievementsService) {}

  // Endpoint: succès de l’utilisateur
  @UseGuards(JwtAuthGuard)
  @Get('me/achievements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List achievements with user unlock status' })
  @ApiOkResponse({ type: AchievementStatusDto, isArray: true, schema: { example: [ { id: 1, code: 'FIRST_PLANT', title: 'Première plante', description: 'Vous avez ajouté votre première plante.', category: 'general', icon: 'leaf', unlocked: true, unlockedAt: '2024-12-15T10:00:00Z' }, { id: 2, code: 'PERFECT_WEEK', title: 'Semaine parfaite', description: 'Tous les indicateurs sont restés dans le vert pendant 7 jours.', category: 'care', icon: 'sun', unlocked: false, unlockedAt: null } ] } })
  async getMyAchievements(@CurrentUser() user: any): Promise<AchievementStatusDto[]> {
    // Appel service
    return this.achievementsService.getUserAchievements(user?.userId);
  }

  // Endpoint: définitions des succès
  @Get('achievements')
  @ApiOperation({ summary: 'List all achievement definitions' })
  @ApiOkResponse({ type: AchievementStatusDto, isArray: true, schema: { example: [ { id: 1, code: 'FIRST_PLANT', title: 'Première plante', description: 'Vous avez ajouté votre première plante.', category: 'general', icon: 'leaf', unlocked: false, unlockedAt: null } ] } })
  async listAll(): Promise<AchievementStatusDto[]> {
    // Appel service
    return this.achievementsService.listAllAchievements();
  }
}
