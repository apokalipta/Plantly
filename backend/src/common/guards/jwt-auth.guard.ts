// Garde JWT: s'appuie sur la stratégie 'jwt' de Passport.
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// Intention: Guard Passport pour sécuriser les routes via JWT
// Objectif: Bloquer l’accès aux endpoints protégés sans jeton valide
// Logique: S’appuie sur JwtStrategy pour valider et injecter request.user

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
