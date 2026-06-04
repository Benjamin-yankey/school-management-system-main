import { IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class GradeItemDto {
  @IsUUID()
  studentId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsString()
  @IsOptional()
  teacherNote?: string;
}

export class BulkCreateGradeDto {
  @IsUUID()
  termId: string;

  @IsUUID()
  classLevelId: string;

  @IsString()
  subject: string;

  grades: GradeItemDto[];
}
