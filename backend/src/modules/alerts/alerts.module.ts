// Module alertes: assemble contrôleur + service, export pour autres modules.
import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  // Dépendance DB (Prisma)
  imports: [DatabaseModule],
  // Contrôleur
  controllers: [AlertsController],
  // Service
  providers: [AlertsService],
  // Export
  exports: [AlertsService],
})
export class AlertsModule {}
