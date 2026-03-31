import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { FeeStatus, FeeType } from '../fee.entity';

export class CreateFeeDto {
  /** Human-readable name shown in the fee table (e.g. "Tuition Fee Q1") */
  @IsString()
  name: string;

  /** Maps to termId on the entity */
  @IsUUID()
  academicTermId: string;

  /** Category / fee type — matches frontend select values */
  @IsEnum(FeeType)
  category: FeeType;

  /** Payment amount — maps to amountDue */
  @IsNumber()
  @Min(0)
  amount: number;

  /** Optional: pre-assign fee to a specific student */
  @IsUUID()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class RecordPaymentDto {
  @IsNumber()
  @Min(0.01)
  amountPaid: number;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

export class UpdateFeeStatusDto {
  @IsEnum(FeeStatus)
  status: FeeStatus;

  @IsString()
  @IsOptional()
  note?: string;
}
