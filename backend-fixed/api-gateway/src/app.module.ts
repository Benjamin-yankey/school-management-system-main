import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { JwtStrategy } from './jwt.strategy';
import { ProxyController } from './proxy.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { MustResetGuard } from './common/guards/must-reset.guard';
import { BlacklistGuard } from './common/guards/blacklist.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),
  ],
  controllers: [ProxyController],
  providers: [JwtStrategy, JwtAuthGuard, RolesGuard, MustResetGuard, BlacklistGuard],
})
export class AppModule {}
