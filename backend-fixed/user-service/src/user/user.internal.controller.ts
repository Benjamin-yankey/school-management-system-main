import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { InternalGuard } from './internal.guard';

/**
 * Service-to-service HTTP endpoints (formerly Kafka message patterns).
 * Called by auth-service over HTTP; protected by the shared INTERNAL_KEY.
 */
@Controller('internal')
@UseGuards(InternalGuard)
export class UserInternalController {
  constructor(private readonly userService: UserService) {}

  @Get('by-email')
  async findByEmail(@Query('email') email: string) {
    // Wrapped so the response body is never empty (fetch().json() needs JSON).
    const user = await this.userService.findByEmail(email);
    return { user };
  }
}
