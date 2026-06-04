import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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

  @IsUUID()
  @IsOptional()
  parentUserId?: string;

  @IsString()
  @IsOptional()
  relationship?: string;
}
