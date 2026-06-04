import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Guards service-to-service ("internal") HTTP endpoints. On the free tier every
 * service has a public URL, so these routes must not be openly callable.
 * Callers send the shared INTERNAL_KEY secret.
 */
@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const provided = req.headers['x-internal-key'];
    const expected = process.env.INTERNAL_KEY;
    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid internal key');
    }
    return true;
  }
}
