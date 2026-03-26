import { IsEmail, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsIn(['teacher', 'student', 'parent'])
  role: string;
}
