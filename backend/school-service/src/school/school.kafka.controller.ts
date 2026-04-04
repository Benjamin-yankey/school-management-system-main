import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SchoolService } from './school.service';

@Controller()
export class SchoolKafkaController {
  constructor(private readonly schoolService: SchoolService) {}

  @MessagePattern('school.validate')
  validate(@Payload() data: { schoolId: string }) {
    return this.schoolService.validate(data.schoolId);
  }

  @MessagePattern('school.get-details')
  getDetails(@Payload() data: { schoolId: string }) {
    return this.schoolService.getDetails(data.schoolId);
  }
}

