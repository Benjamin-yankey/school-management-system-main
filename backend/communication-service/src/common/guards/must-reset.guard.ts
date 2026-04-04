import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class MustResetGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.mustResetPassword) {
      throw new ForbiddenException(
        'You must reset your password before continuing.',
      );
    }

    return true;
  }
}
