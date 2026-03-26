import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Credential } from './credential.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthKafkaController } from './auth.kafka.controller';
import { JwtStrategy } from './jwt.strategy';
import { TokenBlacklistService } from './token-blacklist.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credential]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),

    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'auth-service-producer', brokers: [process.env.KAFKA_BROKER] },
          consumer: { groupId: 'auth-reply-consumer' },
        },
      },
    ]),
  ],
  controllers: [AuthController, AuthKafkaController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class AuthModule {}
