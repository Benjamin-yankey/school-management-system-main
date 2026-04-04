import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { BulkRecordAttendanceDto } from './dto/record-attendance.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetSectionAttendanceDto } from './dto/get-section-attendance.dto';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @Roles('superadmin', 'administration', 'teacher')
  @Post('bulk')
  recordBulk(@Body() dto: BulkRecordAttendanceDto) {
    return this.attendanceService.recordBulk(dto);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('student/:studentId/summary')
  getSummary(
    @Param('studentId') studentId: string,
    @Query('termId') termId: string,
  ) {
    return this.attendanceService.getStudentSummary(studentId, termId);
  }

  @Roles('superadmin', 'administration', 'teacher')
  @Get('section')
  getBySection(
    @Query() query: GetSectionAttendanceDto
  ) {
    return this.attendanceService.getBySection(query.sectionId, query.date, query.termId);
  }
}
