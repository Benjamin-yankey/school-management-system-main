import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class LinkStudentDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsOptional()
  relationship?: string;
}
