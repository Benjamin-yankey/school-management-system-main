import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherSection } from './teacher-section.entity';
import { Student } from '../student/student.entity';
import { StudentEnrollment } from '../student/student-enrollment.entity';
import { Section } from '../classes/section.entity';
import { AssignSectionDto } from './dto/assign-section.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(TeacherSection)
    private readonly teacherSectionRepo: Repository<TeacherSection>,
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  // ── Called by Administration ─────────────────────────────────────

  async assignTeacherToSection(
    teacherUserId: string,
    dto: AssignSectionDto,
  ): Promise<TeacherSection> {
    const section = await this.sectionRepo.findOneBy({ id: dto.sectionId });
    if (!section) throw new NotFoundException('Section not found.');

    const existing = await this.teacherSectionRepo.findOneBy({
      teacherUserId,
      sectionId: dto.sectionId,
    });
    if (existing) {
      throw new BadRequestException('Teacher is already assigned to this section.');
    }

    const record = this.teacherSectionRepo.create({
      teacherUserId,
      sectionId: dto.sectionId,
    });
    return this.teacherSectionRepo.save(record);
  }

  async unassignTeacherFromSection(
    teacherUserId: string,
    sectionId: string,
  ): Promise<void> {
    const record = await this.teacherSectionRepo.findOneBy({
      teacherUserId,
      sectionId,
    });
    if (!record) throw new NotFoundException('Assignment not found.');
    await this.teacherSectionRepo.remove(record);
  }

  async listAssignmentsForSection(sectionId: string): Promise<TeacherSection[]> {
    return this.teacherSectionRepo.find({ where: { sectionId } });
  }

  // ── Called by Teacher (self) ─────────────────────────────────────

  async getMySections(teacherUserId: string): Promise<TeacherSection[]> {
    return this.teacherSectionRepo.find({
      where: { teacherUserId },
      relations: ['section', 'section.classLevel'],
      order: { assignedAt: 'ASC' },
    });
  }

  async getMyStudents(teacherUserId: string): Promise<Student[]> {
    // Get all sectionIds assigned to this teacher
    const assignments = await this.teacherSectionRepo.findBy({ teacherUserId });
    if (!assignments.length) return [];

    const sectionIds = assignments.map((a) => a.sectionId);

    // Find all enrollments in those sections
    const enrollments = await this.enrollmentRepo
      .createQueryBuilder('e')
      .where('e.sectionId IN (:...sectionIds)', { sectionIds })
      .getMany();

    if (!enrollments.length) return [];

    const studentIds = [...new Set(enrollments.map((e) => e.studentId))];

    return this.studentRepo.find({
      where: studentIds.map((id) => ({ id })),
      relations: [
        'enrollments',
        'enrollments.classLevel',
        'enrollments.academicYear',
        'enrollments.section',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async getStudentsInSection(
    teacherUserId: string,
    sectionId: string,
  ): Promise<Student[]> {
    // Confirm teacher is assigned to this section
    const assignment = await this.teacherSectionRepo.findOneBy({
      teacherUserId,
      sectionId,
    });
    if (!assignment) {
      throw new NotFoundException('You are not assigned to this section.');
    }

    const enrollments = await this.enrollmentRepo.findBy({ sectionId });
    if (!enrollments.length) return [];

    const studentIds = enrollments.map((e) => e.studentId);
    return this.studentRepo.find({
      where: studentIds.map((id) => ({ id })),
      relations: ['enrollments', 'enrollments.classLevel', 'enrollments.academicYear'],
      order: { createdAt: 'DESC' },
    });
  }
}
