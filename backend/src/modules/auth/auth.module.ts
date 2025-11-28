import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET || 'TODO_SECRET',
      signOptions: { expiresIn: '15m' },
      // TODO: configure refresh tokens and more JWT options
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
