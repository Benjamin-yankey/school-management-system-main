import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { AttendanceStatus } from '../attendance.entity';
import { Type } from 'class-transformer';

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceItemDto)
  attendance: AttendanceItemDto[];
}
