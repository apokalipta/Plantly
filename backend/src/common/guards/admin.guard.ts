import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user || (user.role !== 'ADMIN' && user.isAdmin !== true)) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
