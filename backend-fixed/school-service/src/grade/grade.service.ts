import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './grade.entity';
import { BulkCreateGradeDto } from './dto/create-grade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
  ) {}

  autoComputeRemark(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Credit';
    if (score >= 50) return 'Pass';
    return 'Fail';
  }

  async createBulk(dto: BulkCreateGradeDto): Promise<{ message: string }> {
    const { termId, classLevelId, subject, grades } = dto;

    for (const item of grades) {
      const remark = this.autoComputeRemark(item.score);
      
      // Upsert by student + term + subject
      const existing = await this.gradeRepo.findOneBy({ 
        studentId: item.studentId, 
        termId, 
        subject 
      });

      if (existing) {
        await this.gradeRepo.update(existing.id, { 
          score: item.score, 
          remark, 
          teacherNote: item.teacherNote,
          classLevelId // ensure class matches
        });
      } else {
        await this.gradeRepo.save(
          this.gradeRepo.create({
            studentId: item.studentId,
            termId,
            classLevelId,
            subject,
            score: item.score,
            remark,
            teacherNote: item.teacherNote,
          }),
        );
      }
    }

    return { message: `Grades recorded for ${grades.length} students.` };
  }

  async getReportCard(studentId: string, termId: string) {
    return this.gradeRepo.find({
      where: { studentId, termId },
      order: { subject: 'ASC' },
    });
  }
}
