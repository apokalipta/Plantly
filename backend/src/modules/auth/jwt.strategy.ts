// Stratégie JWT: extrait, vérifie et valide l'utilisateur à chaque requête protégée.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../database/prisma.service';
// Intention: Valider les JWT et injecter l’utilisateur courant
// Objectif: Refuser les jetons expirés/invalides et vérifier tokenVersion
// Logique: Extraction du Bearer, lookup Prisma et synchronisation avec invalidations

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prisma: PrismaService, configService: ConfigService) {
    // Configuration de l'extraction et du secret du JWT
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') || configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    // Vérifie l'identité et la version de jeton de l'utilisateur
    const userId: string | undefined = payload?.sub;
    if (!userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const version: number | undefined = payload?.tokenVersion;
    if (version === undefined || version !== user.tokenVersion) throw new UnauthorizedException();
    return { userId: user.id, email: user.email };
  }
}
