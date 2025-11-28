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
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.generateTokens(user);
  }

  async logout(userIdOrToken: any): Promise<void> {
    // TODO: invalidate refresh token/session if implementing token store
    return;
  }

  async requestPasswordReset(dto: ForgotPasswordDto): Promise<void> {
    // TODO: send reset email or push; do not reveal user existence
    return;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    // TODO: validate password reset token and update password
    return;
  }

  private async generateTokens(user: { id: string; email: string }): Promise<TokenPairDto> {
    const accessSecret = this.config.get<string>('JWT_ACCESS_TOKEN_SECRET') || 'TODO_ACCESS_SECRET';
    const refreshSecret = this.config.get<string>('JWT_REFRESH_TOKEN_SECRET') || 'TODO_REFRESH_SECRET';
    const payload = { sub: user.id, email: user.email };
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
