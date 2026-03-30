import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class EnrollStudentDto {
  @IsUUID()
  @IsNotEmpty()
  applicantId: string;

  @IsUUID()
  @IsNotEmpty()
  classLevelId: string;

  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;

  @IsUUID()
  @IsOptional()
  sectionId?: string;
}
