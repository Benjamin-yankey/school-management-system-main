import { IsEnum } from 'class-validator';
import { ApplicationStatus } from '../application.entity';

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
