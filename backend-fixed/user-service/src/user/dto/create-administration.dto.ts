import { IsEmail, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAdministrationDto {
  @IsEmail()
  email: string;

  @IsUUID()
  schoolId: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  middleName?: string;
}
