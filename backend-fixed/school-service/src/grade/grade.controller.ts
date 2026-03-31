import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GradeService } from './grade.service';
import { BulkCreateGradeDto } from './dto/create-grade.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Controller('grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Roles('superadmin', 'administration', 'teacher')
  @Post('bulk')
  createBulk(@Body() dto: BulkCreateGradeDto) {
    return this.gradeService.createBulk(dto);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('report-card/:studentId')
  getReportCard(
    @Param('studentId') studentId: string,
    @Query('termId') termId: string,
  ) {
    return this.gradeService.getReportCard(studentId, termId);
  }
}
