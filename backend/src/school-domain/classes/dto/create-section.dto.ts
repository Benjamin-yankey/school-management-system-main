import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  academicYearId: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;
}
