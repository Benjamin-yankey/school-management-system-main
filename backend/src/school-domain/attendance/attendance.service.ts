import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from './attendance.entity';
import { BulkRecordAttendanceDto } from './dto/record-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
  ) {}

  async recordBulk(dto: BulkRecordAttendanceDto): Promise<{ message: string }> {
    const { sectionId, termId, date, attendance } = dto;

    for (const item of attendance) {
      await this.attendanceRepo.upsert(
        {
          studentId: item.studentId,
          sectionId,
          termId,
          date,
          status: item.status,
          note: item.note,
        },
        ['studentId', 'sectionId', 'date'],
      );
    }

    return { message: `Attendance recorded for ${attendance.length} students.` };
  }

  async getStudentSummary(studentId: string, termId: string) {
    const records = await this.attendanceRepo.findBy({ studentId, termId });
    
    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: records.length,
    };

    records.forEach((r) => {
      summary[r.status]++;
    });

    return summary;
  }
}
