import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fee, FeeStatus } from './fee.entity';
import { CreateFeeDto, RecordPaymentDto, UpdateFeeStatusDto } from './dto/fee.dto';

@Injectable()
export class FeeService {
  constructor(
    @InjectRepository(Fee)
    private readonly feeRepo: Repository<Fee>,
  ) {}

  async createFee(dto: CreateFeeDto): Promise<Fee> {
    return this.feeRepo.save(this.feeRepo.create(dto));
  }

  async findAllFees(studentId?: string, termId?: string): Promise<Fee[]> {
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (termId) where.termId = termId;
    return this.feeRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Fee> {
    const fee = await this.feeRepo.findOneBy({ id });
    if (!fee) throw new NotFoundException('Fee not found');
    return fee;
  }

  async recordPayment(id: string, dto: RecordPaymentDto): Promise<Fee> {
    const fee = await this.findOne(id);
    
    if (fee.status === FeeStatus.PAID || fee.status === FeeStatus.WAIVED) {
      throw new BadRequestException('Fee is already settled');
    }

    const newPaid = fee.amountPaid + dto.amountPaid;
    if (newPaid > fee.amountDue) {
      throw new BadRequestException(`Overpayment detected. Remaining balance is ${fee.amountDue - fee.amountPaid}`);
    }

    fee.amountPaid = newPaid;
    fee.reference = dto.reference || fee.reference;
    fee.note = dto.note || fee.note;

    if (fee.amountPaid === fee.amountDue) {
      fee.status = FeeStatus.PAID;
    } else if (fee.amountPaid > 0) {
      fee.status = FeeStatus.PARTIAL;
    }

    return this.feeRepo.save(fee);
  }

  async waiveFee(id: string, note?: string): Promise<Fee> {
    const fee = await this.findOne(id);
    fee.status = FeeStatus.WAIVED;
    if (note) fee.note = note;
    return this.feeRepo.save(fee);
  }

  async getBalanceSummary(studentId: string) {
    const fees = await this.feeRepo.findBy({ studentId });
    const summary = {
      totalDue: 0,
      totalPaid: 0,
      balance: 0,
    };

    fees.forEach((f) => {
      if (f.status !== FeeStatus.WAIVED) {
        summary.totalDue += f.amountDue;
        summary.totalPaid += f.amountPaid;
      }
    });

    summary.balance = summary.totalDue - summary.totalPaid;
    return summary;
  }
}
