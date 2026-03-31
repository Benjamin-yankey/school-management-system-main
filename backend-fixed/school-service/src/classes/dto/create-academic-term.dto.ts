import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAcademicTermDto {
  @IsString()
  name: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsUUID()
  academicYearId: string;

  @IsBoolean()
  @IsOptional()
  isCurrent?: boolean;
}
