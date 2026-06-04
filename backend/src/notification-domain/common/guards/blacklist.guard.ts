import {
  CanActivate,
  ExecutionContext,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import Redis from 'ioredis';

@Injectable()
export class BlacklistGuard implements CanActivate, OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  onModuleInit() {
    this.redis = new Redis(this.config.get('REDIS_URL'));
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return true; // let JwtAuthGuard handle missing token

    const decoded = this.jwtService.decode(token) as { jti?: string };
    if (!decoded?.jti) return true;

    const revoked = await this.redis.get(`blacklist:${decoded.jti}`);
    if (revoked) throw new UnauthorizedException('Token has been revoked.');
    return true;
  }
}
