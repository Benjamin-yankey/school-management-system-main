// dto/get-section-attendance.dto.ts
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetSectionAttendanceDto {
    @IsUUID()
    sectionId: string;

    @IsDateString()
    date: string;

    @IsUUID()
    @IsOptional()
    termId?: string;
}