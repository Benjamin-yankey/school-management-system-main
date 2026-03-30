import { IsEnum } from 'class-validator';
import { StudentStatus } from '../student.entity';

export class UpdateStudentStatusDto {
  @IsEnum(StudentStatus)
  status: StudentStatus;
}
