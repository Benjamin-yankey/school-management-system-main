import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FeeService } from './fee.service';
import { CreateFeeDto, RecordPaymentDto } from './dto/fee.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Controller('fees')
export class FeeController {
  constructor(private readonly feeService: FeeService) {}

  @Roles('superadmin', 'administration')
  @Post()
  createFee(@Body() dto: CreateFeeDto) {
    return this.feeService.createFee(dto);
  }

  @Roles('superadmin', 'administration', 'student', 'parent')
  @Get()
  findAllFees(
    @Query('studentId') studentId?: string,
    @Query('termId') termId?: string,
  ) {
    return this.feeService.findAllFees(studentId, termId);
  }

  @Roles('superadmin', 'administration')
  @Patch(':id/pay')
  recordPayment(@Param('id') id: string, @Body() dto: RecordPaymentDto) {
    return this.feeService.recordPayment(id, dto);
  }

  @Roles('superadmin', 'administration')
  @Patch(':id/waive')
  waiveFee(@Param('id') id: string, @Body('note') note?: string) {
    return this.feeService.waiveFee(id, note);
  }

  /** GET /fees/balance/:studentId — original route kept for compatibility */
  @Roles('superadmin', 'administration', 'student', 'parent')
  @Get('balance/:studentId')
  getBalanceSummary(@Param('studentId') studentId: string) {
    return this.feeService.getBalanceSummary(studentId);
  }

  /** GET /fees/student/:studentId/balance — matches school-panel frontend URL */
  @Roles('superadmin', 'administration', 'student', 'parent')
  @Get('student/:studentId/balance')
  getStudentBalance(@Param('studentId') studentId: string) {
    return this.feeService.getBalanceSummary(studentId);
  }

  /** POST /fees/student/:studentId/pay — lump-sum payment distributed across pending fees */
  @Roles('superadmin', 'administration')
  @Post('student/:studentId/pay')
  payStudentBalance(
    @Param('studentId') studentId: string,
    @Body('amount') amount: number,
    @Body('reference') reference?: string,
  ) {
    return this.feeService.payStudentBalance(studentId, amount, reference);
  }
}

