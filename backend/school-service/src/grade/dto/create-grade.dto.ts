import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

  @IsUUID()
  subjectId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeItemDto)
  grades: GradeItemDto[];
}