import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { BulkPromoteDto } from './dto/bulk-promote.dto';
import { ManualPromoteDto } from './dto/manual-promote.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('superadmin', 'administration')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Get('preview/:classLevelId/:academicYearId')
  preview(
    @Param('classLevelId') classLevelId: string,
    @Param('academicYearId') academicYearId: string,
  ) {
    return this.promotionService.previewBulkPromotion(classLevelId, academicYearId);
  }

  @Post('bulk')
  bulkPromote(@Body() dto: BulkPromoteDto) {
    return this.promotionService.bulkPromote(dto);
  }

  @Post('manual')
  manualPromote(@Body() dto: ManualPromoteDto) {
    return this.promotionService.manualPromote(dto);
  }
}
