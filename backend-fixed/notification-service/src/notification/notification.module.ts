import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './email-log.entity';
import { Notification } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationKafkaController } from './notification.kafka.controller';
import { NotificationController } from './notification.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, Notification])],
  controllers: [NotificationKafkaController, NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
