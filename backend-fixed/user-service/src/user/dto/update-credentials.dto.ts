import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCredentialsDto {
  @IsString()
  currentPassword: string;

  @IsEmail()
  @IsOptional()
  newEmail?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  newPassword?: string;
}
