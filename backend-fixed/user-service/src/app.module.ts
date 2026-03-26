import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { User } from './user/user.entity';
import { Profile } from './user/profile.entity';
import { UserModule } from './user/user.module';
import { SeederModule } from './seeder/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        schema: 'user',
        entities: [User, Profile],
        synchronize: true,
      }),
    }),

    PassportModule,
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),
    UserModule,
    SeederModule,
  ],
})
export class AppModule {}
