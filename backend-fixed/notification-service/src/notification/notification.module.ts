import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './email-log.entity';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationInternalController } from './notification.internal.controller';
import { NotificationController } from './notification.controller';
import { AnnouncementsController } from './announcements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, Notification])],
  controllers: [
    NotificationInternalController,
    NotificationController,
    AnnouncementsController,
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
