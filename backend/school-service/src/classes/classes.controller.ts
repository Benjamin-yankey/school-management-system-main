import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Controller()
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // ── Academic Years ───────────────────────────────────────────────

  @Roles('superadmin', 'administration')
  @Post('academic-years')
  createAcademicYear(@Body() dto: CreateAcademicYearDto) {
    return this.classesService.createAcademicYear(dto);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('academic-years')
  findAllAcademicYears() {
    return this.classesService.findAllAcademicYears();
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('academic-years/active')
  getActiveAcademicYear() {
    return this.classesService.getActiveAcademicYear();
  }

  @Roles('superadmin', 'administration')
  @Patch('academic-years/:id/activate')
  setActiveAcademicYear(@Param('id') id: string) {
    return this.classesService.setActiveAcademicYear(id);
  }

  // ── Academic Terms ────────────────────────────────────────────────

  @Roles('superadmin', 'administration')
  @Post('academic-terms')
  createAcademicTerm(@Body() dto: CreateAcademicTermDto) {
    return this.classesService.createAcademicTerm(dto);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('academic-terms')
  findAllAcademicTerms(@Query('academicYearId') academicYearId?: string) {
    return this.classesService.findAllAcademicTerms(academicYearId);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('academic-terms/active')
  getActiveAcademicTerm() {
    return this.classesService.getActiveAcademicTerm();
  }

  @Roles('superadmin', 'administration')
  @Patch('academic-terms/:id/activate')
  setActiveAcademicTerm(@Param('id') id: string) {
    return this.classesService.setActiveAcademicTerm(id);
  }

  // ── Class Levels ─────────────────────────────────────────────────

  @Roles('superadmin', 'administration')
  @Post('classes/seed')
  seedClassLevels() {
    return this.classesService.seedClassLevels();
  }

  @Roles('superadmin', 'administration')
  @Post('classes')
  createClassLevel(@Body() dto: CreateClassLevelDto) {
    return this.classesService.createClassLevel(dto);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('classes')
  findAllClassLevels() {
    return this.classesService.findAllClassLevels();
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('classes/:id')
  findClassLevelById(@Param('id') id: string) {
    return this.classesService.findClassLevelById(id);
  }

  @Roles('superadmin', 'administration')
  @Patch('classes/:id')
  updateClassLevel(@Param('id') id: string, @Body() dto: Partial<CreateClassLevelDto>) {
    return this.classesService.updateClassLevel(id, dto);
  }

  // ── Sections ─────────────────────────────────────────────────────

  @Roles('superadmin', 'administration')
  @Post('classes/:classLevelId/sections')
  createSection(
    @Param('classLevelId') classLevelId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.classesService.createSection(classLevelId, dto);
  }

  @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
  @Get('classes/:classLevelId/sections')
  getSectionsByClass(@Param('classLevelId') classLevelId: string) {
    return this.classesService.getSectionsByClass(classLevelId);
  }

  @Roles('superadmin', 'administration')
  @Patch('sections/:id')
  updateSection(@Param('id') id: string, @Body() dto: Partial<CreateSectionDto>) {
    return this.classesService.updateSection(id, dto);
  }

  @Roles('superadmin', 'administration')
  @Delete('sections/:id')
  deleteSection(@Param('id') id: string) {
    return this.classesService.deleteSection(id);
  }
}
