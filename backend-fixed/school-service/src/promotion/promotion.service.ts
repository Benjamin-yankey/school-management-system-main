import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEnrollment, PromotionStatus } from '../student/student-enrollment.entity';
import { Student, StudentStatus } from '../student/student.entity';
import { ClassesService } from '../classes/classes.service';
import { BulkPromoteDto } from './dto/bulk-promote.dto';
import { ManualPromoteDto } from './dto/manual-promote.dto';

const MAX_CLASS_ORDER = 12; // SHS 3

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly classesService: ClassesService,
  ) {}

  async previewBulkPromotion(classLevelId: string, academicYearId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { classLevelId, academicYearId, promotionStatus: PromotionStatus.PENDING },
      relations: ['student', 'classLevel'],
    });

    const classLevel = await this.classesService.findClassLevelById(classLevelId);
    const isLastClass = classLevel.order === MAX_CLASS_ORDER;

    const toPromote = enrollments.filter((e) => !e.isRepeating);
    const toRepeat = enrollments.filter((e) => e.isRepeating);

    return {
      total: enrollments.length,
      toPromote: toPromote.length,
      toGraduate: isLastClass ? toPromote.length : 0,
      toRepeat: toRepeat.length,
      repeatingStudents: toRepeat.map((e) => ({
        enrollmentId: e.id,
        student: { id: e.student.id, name: `${e.student.firstName} ${e.student.lastName}` },
      })),
    };
  }

  async bulkPromote(dto: BulkPromoteDto): Promise<{
    promoted: number;
    graduated: number;
    skipped: number;
  }> {
    // Validate years
    await this.classesService.getAcademicYearOrFail(dto.fromAcademicYearId);
    await this.classesService.getAcademicYearOrFail(dto.toAcademicYearId);

    const classLevel = await this.classesService.findClassLevelById(dto.classLevelId);
    const isLastClass = classLevel.order === MAX_CLASS_ORDER;

    // Get all pending, non-repeating enrollments for this class + year
    const enrollments = await this.enrollmentRepo.find({
      where: {
        classLevelId: dto.classLevelId,
        academicYearId: dto.fromAcademicYearId,
        promotionStatus: PromotionStatus.PENDING,
        isRepeating: false,
      },
      relations: ['student'],
    });

    let promoted = 0;
    let graduated = 0;
    let skipped = 0;

    if (isLastClass) {
      // Graduate all
      for (const enrollment of enrollments) {
        await this.enrollmentRepo.update(enrollment.id, {
          promotionStatus: PromotionStatus.GRADUATED,
        });
        await this.studentRepo.update(enrollment.studentId, {
          status: StudentStatus.GRADUATED,
        });
        graduated++;
      }
    } else {
      const nextClass = await this.classesService.getNextClassLevel(classLevel.order);
      if (!nextClass) {
        throw new NotFoundException('Next class level not found');
      }

      for (const enrollment of enrollments) {
        // Check student doesn't already have enrollment in the target year
        const existing = await this.enrollmentRepo.findOne({
          where: {
            studentId: enrollment.studentId,
            academicYearId: dto.toAcademicYearId,
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Mark old enrollment as promoted
        await this.enrollmentRepo.update(enrollment.id, {
          promotionStatus: PromotionStatus.PROMOTED,
        });

        // Create new enrollment in next class
        await this.enrollmentRepo.save(
          this.enrollmentRepo.create({
            studentId: enrollment.studentId,
            classLevelId: nextClass.id,
            academicYearId: dto.toAcademicYearId,
            promotionStatus: PromotionStatus.PENDING,
            isRepeating: false,
          }),
        );

        promoted++;
      }
    }

    return { promoted, graduated, skipped };
  }

  async manualPromote(dto: ManualPromoteDto): Promise<StudentEnrollment> {
    const student = await this.studentRepo.findOneBy({ id: dto.studentId });
    if (!student) throw new NotFoundException('Student not found');

    await this.classesService.getAcademicYearOrFail(dto.fromAcademicYearId);
    await this.classesService.getAcademicYearOrFail(dto.toAcademicYearId);

    // Find existing enrollment in the from year
    const currentEnrollment = await this.enrollmentRepo.findOne({
      where: {
        studentId: dto.studentId,
        classLevelId: dto.classLevelId,
        academicYearId: dto.fromAcademicYearId,
      },
    });

    if (!currentEnrollment) {
      throw new NotFoundException('No enrollment found for this student in the specified class and year');
    }

    // Check for duplicate in target year
    const existing = await this.enrollmentRepo.findOne({
      where: { studentId: dto.studentId, academicYearId: dto.toAcademicYearId },
    });
    if (existing) {
      throw new BadRequestException('Student already has an enrollment in the target academic year');
    }

    if (dto.isRepeating) {
      // Repeat — same class level
      await this.enrollmentRepo.update(currentEnrollment.id, {
        promotionStatus: PromotionStatus.REPEATED,
      });
      await this.studentRepo.update(dto.studentId, { status: StudentStatus.REPEATED });

      return this.enrollmentRepo.save(
        this.enrollmentRepo.create({
          studentId: dto.studentId,
          classLevelId: dto.classLevelId,
          academicYearId: dto.toAcademicYearId,
          sectionId: dto.sectionId ?? null,
          isRepeating: true,
          promotionStatus: PromotionStatus.PENDING,
        }),
      );
    } else {
      // Promote — move to next class
      const classLevel = await this.classesService.findClassLevelById(dto.classLevelId);
      const isLastClass = classLevel.order === MAX_CLASS_ORDER;

      await this.enrollmentRepo.update(currentEnrollment.id, {
        promotionStatus: isLastClass ? PromotionStatus.GRADUATED : PromotionStatus.PROMOTED,
      });

      if (isLastClass) {
        await this.studentRepo.update(dto.studentId, { status: StudentStatus.GRADUATED });
        return currentEnrollment;
      }

      const nextClass = await this.classesService.getNextClassLevel(classLevel.order);
      if (!nextClass) throw new NotFoundException('Next class level not found');

      return this.enrollmentRepo.save(
        this.enrollmentRepo.create({
          studentId: dto.studentId,
          classLevelId: nextClass.id,
          academicYearId: dto.toAcademicYearId,
          sectionId: dto.sectionId ?? null,
          isRepeating: false,
          promotionStatus: PromotionStatus.PENDING,
        }),
      );
    }
  }
}
