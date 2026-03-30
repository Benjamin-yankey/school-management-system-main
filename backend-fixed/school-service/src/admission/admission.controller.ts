import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { CreateAdmissionYearDto } from './dto/create-admission-year.dto';
import { ApplyDto } from './dto/apply.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admissions')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  // ── Public ───────────────────────────────────────────────────────

  @Get('current')
  getCurrentYear() {
    return this.admissionService.getCurrentYear();
  }

  @Post('apply')
  apply(@Body() dto: ApplyDto) {
    return this.admissionService.apply(dto);
  }

  // ── Admin Protected ──────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Post('years')
  createYear(@Body() dto: CreateAdmissionYearDto) {
    return this.admissionService.createYear(dto);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Get('years')
  findAllYears() {
    return this.admissionService.findAllYears();
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Patch('years/:id/open')
  openYear(@Param('id') id: string) {
    return this.admissionService.openYear(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Patch('years/:id/close')
  closeYear(@Param('id') id: string) {
    return this.admissionService.closeYear(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Get('years/:id/applications')
  getApplicationsByYear(@Param('id') id: string) {
    return this.admissionService.getApplicationsByYear(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Get('applications/:id')
  getApplicationById(@Param('id') id: string) {
    return this.admissionService.getApplicationById(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Patch('applications/:id/status')
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.admissionService.updateApplicationStatus(id, dto);
  }
}
