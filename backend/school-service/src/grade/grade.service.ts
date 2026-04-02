import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './grade.entity';
import { Subject } from '../subject/subject.entity';
import { BulkCreateGradeDto } from './dto/create-grade.dto';

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private readonly gradeRepo: Repository<Grade>,
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,
  ) { }

  autoComputeRemark(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Credit';
    if (score >= 50) return 'Pass';
    return 'Fail';
  }

  async createBulk(dto: BulkCreateGradeDto): Promise<{ message: string }> {
    const { termId, classLevelId, subjectId, grades } = dto;

    // Validate subject exists and belongs to the given class level
    const subject = await this.subjectRepo.findOneBy({ id: subjectId });
    if (!subject) {
      throw new NotFoundException(`Subject not found`);
    }
    if (subject.classLevelId !== classLevelId) {
      throw new BadRequestException(
        `Subject "${subject.name}" does not belong to the specified class level`,
      );
    }

    for (const item of grades) {
      const remark = this.autoComputeRemark(item.score);

      const existing = await this.gradeRepo.findOneBy({
        studentId: item.studentId,
        termId,
        subjectId,
      });

      if (existing) {
        await this.gradeRepo.update(existing.id, {
          score: item.score,
          remark,
          teacherNote: item.teacherNote,
          classLevelId,
        });
      } else {
        await this.gradeRepo.save(
          this.gradeRepo.create({
            studentId: item.studentId,
            termId,
            classLevelId,
            subjectId,
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
      order: { createdAt: 'ASC' },
      relations: ['subject'],
    });
  }
}