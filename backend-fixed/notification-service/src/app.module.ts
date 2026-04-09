import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EmailLog } from './notification/email-log.entity';
import { Notification } from './notification/notification.entity';
import { NotificationModule } from './notification/notification.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        schema: 'notification',
        entities: [EmailLog, Notification],
        synchronize: true,
      }),
    }),

    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),

    MailerModule.forRootAsync({

      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: true,
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
          tls: {
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"School Management" <${config.get('MAIL_FROM')}>`,
        },
      }),
    }),

    NotificationModule,
  ],
  providers: [JwtStrategy],
})
export class AppModule {}
