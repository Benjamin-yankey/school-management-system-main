import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class ManualPromoteDto {
  @IsUUID()
  studentId: string;

  @IsUUID()
  fromAcademicYearId: string;

  @IsUUID()
  toAcademicYearId: string;

  @IsUUID()
  classLevelId: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsBoolean()
  isRepeating: boolean;
}
