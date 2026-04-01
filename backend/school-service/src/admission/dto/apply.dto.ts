import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsValidAge } from '../../common/decorators/is-valid-age.decorator';

export class ApplyDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsDateString()
  @IsValidAge(3, 30)
  dateOfBirth: string;

  @IsString()
  @IsNotEmpty()
  areaOfInterest: string;
}
