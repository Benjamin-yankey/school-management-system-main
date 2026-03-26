import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AuthModule } from './auth/auth.module';
import { Credential } from './auth/credential.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        schema: 'auth',
        entities: [Credential],
        synchronize: true,
      }),
    }),

    PassportModule,
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),
    AuthModule,
  ],
})
export class AppModule {}
