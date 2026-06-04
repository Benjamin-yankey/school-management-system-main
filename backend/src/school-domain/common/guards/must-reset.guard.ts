import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class MustResetGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const { user } = ctx.switchToHttp().getRequest();
    if (user?.mustResetPassword) {
      throw new ForbiddenException('You must reset your password before continuing.');
    }
    return true;
  }
}
