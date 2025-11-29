import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
  ],
})
export class AppModule {}
