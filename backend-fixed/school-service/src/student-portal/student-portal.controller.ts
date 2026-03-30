import { Controller, Get, UseGuards } from '@nestjs/common';
import { StudentPortalService } from './student-portal.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('student')
@Controller('student-portal')
export class StudentPortalController {
  constructor(private readonly studentPortalService: StudentPortalService) {}

  /**
   * GET /student-portal/me
   * Returns the student's own record with current enrollment.
   */
  @Get('me')
  getMyRecord(@CurrentUser() user: any) {
    return this.studentPortalService.getMyRecord(user.email);
  }

  /**
   * GET /student-portal/enrollments
   * Returns the student's full enrollment history across academic years.
   */
  @Get('enrollments')
  getMyEnrollments(@CurrentUser() user: any) {
    return this.studentPortalService.getMyEnrollments(user.email);
  }
}
