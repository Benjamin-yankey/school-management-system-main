import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService, EmailEventPayload } from './notification.service';

@Controller()
export class NotificationKafkaController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('notification.email')
  handleEmailEvent(@Payload() data: EmailEventPayload) {
    return this.notificationService.handleEmailEvent(data);
  }
}
