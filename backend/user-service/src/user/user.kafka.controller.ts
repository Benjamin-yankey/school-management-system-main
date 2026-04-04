import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserKafkaController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('user.find-by-email')
  findByEmail(@Payload() data: { email: string }) {
    return this.userService.findByEmail(data.email);
  }

  @MessagePattern('user.enroll-student')
  enrollStudent(@Payload() data: any) {
    return this.userService.enrollStudent(data);
  }
}

