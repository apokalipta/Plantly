import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as path from 'path';
import { AppConfig } from './config/app.config';
import { DbConfig } from './config/db.config';
import { JwtConfig } from './config/jwt.config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { DevicesModule } from './modules/devices/devices.module';
import { PlantsModule } from './modules/plants/plants.module';
import { WikiModule } from './modules/wiki/wiki.module';
import { MeasurementsModule } from './modules/measurements/measurements.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { DatabaseModule } from './database/database.module';
import { DeviceTelemetryModule } from './modules/device-telemetry/device-telemetry.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [AppConfig, DbConfig, JwtConfig] }),
    // Intention: Servir les médias publics depuis le disque
    // Objectif: Exposer un répertoire contrôlé en lecture via /media
    // Logique: Le chemin est dérivé de la configuration et isolé du code applicatif
    ServeStaticModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const basePath = config.get<string>('MEDIA_BASE_PATH') || path.join(process.cwd(), 'media');
        return [{ rootPath: basePath, serveRoot: '/media' }];
      },
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    UserSettingsModule,
    DevicesModule,
    PlantsModule,
    WikiModule,
    MeasurementsModule,
    AlertsModule,
    AchievementsModule,
    DeviceTelemetryModule,
    // MediaModule added in separate module file
  ],
})
export class AppModule {}
