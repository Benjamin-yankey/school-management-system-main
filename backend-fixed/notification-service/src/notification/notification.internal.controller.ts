import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NotificationService, EmailEventPayload } from './notification.service';
import { InternalGuard } from './internal.guard';

/**
 * Service-to-service HTTP endpoint (formerly the Kafka 'notification.email'
 * event). Called by user-service over HTTP; protected by the shared INTERNAL_KEY.
 */
@Controller('internal')
@UseGuards(InternalGuard)
export class NotificationInternalController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('email')
  async handleEmail(@Body() data: EmailEventPayload) {
    await this.notificationService.handleEmailEvent(data);
    return { ok: true };
  }
}
