import { IsEmail, IsUUID } from 'class-validator';

export class CreateAdministrationDto {
  @IsEmail()
  email: string;

  @IsUUID()
  schoolId: string;
}
