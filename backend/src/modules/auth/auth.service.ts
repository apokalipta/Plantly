import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenPairDto } from './dto/token-pair.dto';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<TokenPairDto> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }
    const saltRounds = 10; // TODO: move to config
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        emailVerified: false,
      },
    });
    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<TokenPairDto> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateTokens(user);
  }

  async refreshTokens(dto: RefreshTokenDto): Promise<TokenPairDto> {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'TODO_REFRESH_SECRET';
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const userId: string | undefined = payload?.sub;
    const version: number | undefined = payload?.tokenVersion;
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (version === undefined || version !== user.tokenVersion) {
      throw new UnauthorizedException('Refresh token invalidated');
    }
    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } });
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    // TODO: send reset email or push; do not reveal user existence
    return;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // TODO: validate reset token properly (email flow). For now, assume token encodes userId as JWT.
    const resetSecret = this.config.get<string>('JWT_RESET_TOKEN_SECRET') || 'TODO_RESET_SECRET';
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(dto.token, { secret: resetSecret });
    } catch {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const userId: string | undefined = payload?.sub;
    if (!userId) throw new BadRequestException('Invalid reset token payload');
    const saltRounds = 10; // TODO: move to config
    const newHash = await bcrypt.hash(dto.newPassword, saltRounds);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash, tokenVersion: { increment: 1 } } });
  }

  private async generateTokens(user: { id: string; email: string; tokenVersion?: number }): Promise<TokenPairDto> {
    const accessSecret = this.config.get<string>('JWT_ACCESS_TOKEN_SECRET') || 'TODO_ACCESS_SECRET';
    const refreshSecret = this.config.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'TODO_REFRESH_SECRET';
    const payload = { sub: user.id, email: user.email, tokenVersion: user.tokenVersion ?? 0 };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: '15m', // TODO: make configurable
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d', // TODO: make configurable
    });
    return { accessToken, refreshToken };
  }
}
