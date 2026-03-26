import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeederService } from './seeder.service';
import { User } from '../user/user.entity';
import { Credential } from './credential-seed.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      name: 'seeder',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        name: 'seeder',
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        schema: 'user',
        entities: [User, Credential],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([User, Credential], 'seeder'),
  ],
  providers: [SeederService],
})
export class SeederModule {}
