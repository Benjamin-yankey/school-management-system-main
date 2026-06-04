import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '../attendance.entity';

export class AttendanceItemDto {
  @IsUUID()
  studentId: string;

  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @IsString()
  @IsOptional()
  note?: string;
}

export class BulkRecordAttendanceDto {
  @IsUUID()
  sectionId: string;

  @IsUUID()
  termId: string;

  @IsString() // YYYY-MM-DD
  date: string;

  attendance: AttendanceItemDto[];
}
