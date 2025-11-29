import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService, configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET') || 'TODO_SECRET',
    });
  }

  async validate(payload: any) {
    const userId: string | undefined = payload?.sub;
    if (!userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const version: number | undefined = payload?.tokenVersion;
    if (version === undefined || version !== user.tokenVersion) throw new UnauthorizedException();
    return { userId: user.id, email: user.email };
  }
}
