import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { FeeStatus, FeeType } from '../fee.entity';

export class CreateFeeDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  termId: string;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsNumber()
  @Min(0)
  amountDue: number;

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
