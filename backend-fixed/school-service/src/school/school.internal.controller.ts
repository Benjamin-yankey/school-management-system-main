import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SchoolService } from './school.service';
import { InternalGuard } from './internal.guard';

/**
 * Service-to-service HTTP endpoints (formerly Kafka message patterns).
 * Called by user-service over HTTP; protected by the shared INTERNAL_KEY.
 */
@Controller('internal/schools')
@UseGuards(InternalGuard)
export class SchoolInternalController {
  constructor(private readonly schoolService: SchoolService) {}

  @Get(':schoolId/validate')
  validate(@Param('schoolId') schoolId: string) {
    return this.schoolService.validate(schoolId);
  }
}
