import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailLog } from './email-log.entity';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { AnnouncementsController } from './announcements.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailLog, Notification]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
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
  ],
  controllers: [NotificationController, AnnouncementsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
