import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAdmissionYearDto {
  @IsUUID()
  @IsNotEmpty()
  academicYearId: string;
}
