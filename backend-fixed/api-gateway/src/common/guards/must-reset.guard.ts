import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class MustResetGuard implements CanActivate {
  private readonly exempt = ['/auth/first-login-reset', '/auth/change-password'];

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    if (this.exempt.includes(req.path)) return true;
    if (req.user?.mustResetPassword) {
      throw new ForbiddenException('You must reset your password before continuing.');
    }
    return true;
  }
}
