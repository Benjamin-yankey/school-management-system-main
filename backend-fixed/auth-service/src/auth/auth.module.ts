import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Credential } from './credential.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthInternalController } from './auth.internal.controller';
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
  ],
  controllers: [AuthController, AuthInternalController],
  providers: [AuthService, JwtStrategy, TokenBlacklistService],
  exports: [TokenBlacklistService],
})
export class AuthModule {}
