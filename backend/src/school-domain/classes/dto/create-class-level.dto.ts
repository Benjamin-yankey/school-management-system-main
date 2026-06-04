import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SchoolLevel } from '../class-level.entity';

export class CreateClassLevelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(SchoolLevel)
  level: SchoolLevel;

  @IsNumber()
  order: number;
}
