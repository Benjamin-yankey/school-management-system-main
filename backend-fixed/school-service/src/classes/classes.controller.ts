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
@Roles('superadmin', 'administration')
@Controller('academic-years')
export class AcademicYearsController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  createAcademicYear(@Body() dto: CreateAcademicYearDto) {
    return this.classesService.createAcademicYear(dto);
  }

  @Get()
  findAllAcademicYears() {
    return this.classesService.findAllAcademicYears();
  }

  @Get('active')
  getActiveAcademicYear() {
    return this.classesService.getActiveAcademicYear();
  }

  @Patch(':id/activate')
  setActiveAcademicYear(@Param('id') id: string) {
    return this.classesService.setActiveAcademicYear(id);
  }

  @Patch(':id')
  updateAcademicYear(@Param('id') id: string, @Body() dto: Partial<CreateAcademicYearDto>) {
    return this.classesService.updateAcademicYear(id, dto);
  }

  @Delete(':id')
  deleteAcademicYear(@Param('id') id: string) {
    return this.classesService.deleteAcademicYear(id);
  }
}

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('superadmin', 'administration')
@Controller('academic-terms')
export class AcademicTermsController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  createAcademicTerm(@Body() dto: CreateAcademicTermDto) {
    return this.classesService.createAcademicTerm(dto);
  }

  @Get()
  findAllAcademicTerms(@Query('academicYearId') academicYearId?: string) {
    return this.classesService.findAllAcademicTerms(academicYearId);
  }

  @Patch(':id/activate')
  setActiveAcademicTerm(@Param('id') id: string) {
    return this.classesService.setActiveAcademicTerm(id);
  }
}

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('superadmin', 'administration')
@Controller('classes')
export class ClassLevelsController {
  constructor(private readonly classesService: ClassesService) {}

  @Post('seed')
  seedClassLevels() {
    return this.classesService.seedClassLevels();
  }

  @Post()
  createClassLevel(@Body() dto: CreateClassLevelDto) {
    return this.classesService.createClassLevel(dto);
  }

  @Get()
  findAllClassLevels() {
    return this.classesService.findAllClassLevels();
  }

  @Get(':id')
  findClassLevelById(@Param('id') id: string) {
    return this.classesService.findClassLevelById(id);
  }

  @Patch(':id')
  updateClassLevel(@Param('id') id: string, @Body() dto: Partial<CreateClassLevelDto>) {
    return this.classesService.updateClassLevel(id, dto);
  }

  @Delete(':id')
  deleteClassLevel(@Param('id') id: string) {
    return this.classesService.deleteClassLevel(id);
  }

  @Post(':classLevelId/sections')
  createSection(
    @Param('classLevelId') classLevelId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.classesService.createSection(classLevelId, dto);
  }

  @Get(':classLevelId/sections')
  getSectionsByClass(@Param('classLevelId') classLevelId: string) {
    return this.classesService.getSectionsByClass(classLevelId);
  }
}

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('superadmin', 'administration')
@Controller('sections')
export class SectionsController {
  constructor(private readonly classesService: ClassesService) {}

  @Patch(':id')
  updateSection(@Param('id') id: string, @Body() dto: Partial<CreateSectionDto>) {
    return this.classesService.updateSection(id, dto);
  }

  @Delete(':id')
  deleteSection(@Param('id') id: string) {
    return this.classesService.deleteSection(id);
  }
}

