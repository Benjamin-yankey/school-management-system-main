import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthKafkaController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.verify-password')
  verifyPassword(@Payload() data: { userId: string; plainPassword: string }) {
    return this.authService.verifyPassword(data.userId, data.plainPassword);
  }

  @EventPattern('auth.credentials-create')
  createCredential(
    @Payload() data: { userId: string; hashedPassword: string; mustResetPassword: boolean },
  ) {
    return this.authService.createCredential(data);
  }

  @EventPattern('auth.credentials-update')
  updateCredential(
    @Payload() data: { userId: string; hashedPassword?: string; mustResetPassword?: boolean },
  ) {
    return this.authService.updateCredential(data);
  }
}
