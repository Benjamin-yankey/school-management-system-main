import { IsEmail, IsUUID, IsString } from 'class-validator';

export class CreateAdministrationDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsUUID()
  schoolId: string;
}

