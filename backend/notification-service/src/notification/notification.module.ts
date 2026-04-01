import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailLog } from './email-log.entity';
import { NotificationService } from './notification.service';
import { NotificationKafkaController } from './notification.kafka.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog])],
  controllers: [NotificationKafkaController],
  providers: [NotificationService],
})
export class NotificationModule {}
