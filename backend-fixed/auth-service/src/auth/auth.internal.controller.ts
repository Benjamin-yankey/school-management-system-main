import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InternalGuard } from './internal.guard';

/**
 * Service-to-service HTTP endpoints (formerly Kafka message/event patterns).
 * Called by user-service over HTTP; protected by the shared INTERNAL_KEY.
 */
@Controller('internal')
@UseGuards(InternalGuard)
export class AuthInternalController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-password')
  verifyPassword(@Body() data: { userId: string; plainPassword: string }) {
    return this.authService.verifyPassword(data.userId, data.plainPassword);
  }

  @Post('credentials')
  async createCredential(
    @Body() data: { userId: string; hashedPassword: string; mustResetPassword: boolean },
  ) {
    await this.authService.createCredential(data);
    return { ok: true };
  }

  @Patch('credentials')
  async updateCredential(
    @Body() data: { userId: string; hashedPassword?: string; mustResetPassword?: boolean },
  ) {
    await this.authService.updateCredential(data);
    return { ok: true };
  }
}
