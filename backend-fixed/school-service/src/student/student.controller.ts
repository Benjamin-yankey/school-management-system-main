import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
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
  constructor(private readonly studentService: StudentService) {}

  @Post('enroll')
  enroll(@Body() dto: EnrollStudentDto) {
    return this.studentService.enroll(dto);
  }

  @Get()
  findAll() {
    return this.studentService.findAll();
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
}
