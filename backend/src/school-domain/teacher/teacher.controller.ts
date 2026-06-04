import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import { AssignSectionDto } from './dto/assign-section.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  // ── Administration: assign/unassign teachers to sections ─────────
  // Routes under /administration/teachers/* — guarded by administration role

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Post('administration/teachers/:teacherUserId/sections')
  assignSection(
    @Param('teacherUserId') teacherUserId: string,
    @Body() dto: AssignSectionDto,
  ) {
    return this.teacherService.assignTeacherToSection(teacherUserId, dto);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Delete('administration/teachers/:teacherUserId/sections/:sectionId')
  unassignSection(
    @Param('teacherUserId') teacherUserId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.teacherService.unassignTeacherFromSection(teacherUserId, sectionId);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Get('administration/sections/:sectionId/teachers')
  listTeachersForSection(@Param('sectionId') sectionId: string) {
    return this.teacherService.listAssignmentsForSection(sectionId);
  }

  // ── Teacher self-service: /teacher/* ─────────────────────────────

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('teacher')
  @Get('teacher/sections')
  getMySections(@CurrentUser() user: any) {
    return this.teacherService.getMySections(user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('teacher')
  @Get('teacher/students')
  getMyStudents(@CurrentUser() user: any) {
    return this.teacherService.getMyStudents(user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('teacher')
  @Get('teacher/sections/:sectionId/students')
  getStudentsInSection(
    @CurrentUser() user: any,
    @Param('sectionId') sectionId: string,
  ) {
    return this.teacherService.getStudentsInSection(user.id, sectionId);
  }
}
