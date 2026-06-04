import { IsOptional, IsString } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;
}
