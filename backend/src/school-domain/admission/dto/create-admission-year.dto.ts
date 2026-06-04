import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdmissionYearDto {
  @IsString()
  @IsNotEmpty()
  year: string;
}
