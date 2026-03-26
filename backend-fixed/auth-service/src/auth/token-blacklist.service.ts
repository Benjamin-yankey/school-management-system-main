import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class TokenBlacklistService implements OnModuleInit, OnModuleDestroy {
  private redis: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.redis = new Redis(this.config.get('REDIS_URL'));
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  async revoke(jti: string, expiresAt: number): Promise<void> {
    const ttl = expiresAt - Math.floor(Date.now() / 1000);
    if (ttl > 0) await this.redis.set(`blacklist:${jti}`, '1', 'EX', ttl);
  }

  async isRevoked(jti: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${jti}`);
    return result !== null;
  }
}
