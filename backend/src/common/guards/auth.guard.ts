// Garde d'auth générique: point d'extension pour valider l'accès.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // À remplacer par une validation réelle (JWT, rôles)
    // TODO: implement JWT validation
    return true;
  }
}

