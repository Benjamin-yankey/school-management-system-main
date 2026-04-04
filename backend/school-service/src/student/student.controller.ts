import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Request } from '@nestjs/common';
import { StudentService } from './student.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('superadmin', 'administration')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) { }

  @Post('enroll')
  enroll(@Body() dto: EnrollStudentDto, @Request() req: any) {
    return this.studentService.enroll(dto, req.user.schoolId);
  }


  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('academicYearId') academicYearId?: string,
    @Query('classLevelId') classLevelId?: string,
  ) {
    return this.studentService.findAll({ page, limit, academicYearId, classLevelId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentService.findOne(id);
  }

  @Get(':id/enrollments')
  getEnrollmentHistory(@Param('id') id: string) {
    return this.studentService.getEnrollmentHistory(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStudentStatusDto) {
    return this.studentService.updateStatus(id, dto);
  }

  @Patch(':id/withdraw')
  withdraw(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.studentService.withdraw(id, reason);
  }
}
