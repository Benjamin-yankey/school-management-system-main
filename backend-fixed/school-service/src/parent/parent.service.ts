import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentStudent } from './parent-student.entity';
import { StudentService } from '../student/student.service';
import { LinkStudentDto } from './dto/link-student.dto';

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(ParentStudent)
    private readonly parentStudentRepo: Repository<ParentStudent>,
    private readonly studentService: StudentService,
  ) {}

  async linkStudent(parentUserId: string, dto: LinkStudentDto): Promise<ParentStudent> {
    // Validate student exists
    await this.studentService.findOne(dto.studentId);

    // Check for duplicate link
    const existing = await this.parentStudentRepo.findOneBy({
      parentUserId,
      studentId: dto.studentId,
    });
    if (existing) {
      throw new BadRequestException('You are already linked to this student.');
    }

    const link = this.parentStudentRepo.create({
      parentUserId,
      studentId: dto.studentId,
      relationship: dto.relationship ?? null,
    });
    return this.parentStudentRepo.save(link);
  }

  /**
   * Administrative linking: skips the "You" terminology in errors.
   */
  async linkStudentByAdmin(parentUserId: string, studentId: string, relationship?: string): Promise<ParentStudent> {
    await this.studentService.findOne(studentId);
    
    const existing = await this.parentStudentRepo.findOneBy({ parentUserId, studentId });
    if (existing) throw new BadRequestException('This link already exists.');

    const link = this.parentStudentRepo.create({
      parentUserId,
      studentId,
      relationship: relationship ?? null,
    });
    return this.parentStudentRepo.save(link);
  }

  async unlinkStudent(parentUserId: string, studentId: string): Promise<void> {
    const link = await this.parentStudentRepo.findOneBy({ parentUserId, studentId });
    if (!link) throw new NotFoundException('Link not found.');
    await this.parentStudentRepo.remove(link);
  }

  async unlinkStudentByAdmin(parentUserId: string, studentId: string): Promise<void> {
    const link = await this.parentStudentRepo.findOneBy({ parentUserId, studentId });
    if (!link) throw new NotFoundException('Relationship link not found.');
    await this.parentStudentRepo.remove(link);
  }

  async getMyChildren(parentUserId: string): Promise<ParentStudent[]> {
    return this.parentStudentRepo.find({
      where: { parentUserId },
      relations: [
        'student',
        'student.enrollments',
        'student.enrollments.classLevel',
        'student.enrollments.academicYear',
        'student.enrollments.section',
      ],
      order: { linkedAt: 'DESC' },
    });
  }

  async getChildDetail(parentUserId: string, studentId: string): Promise<ParentStudent> {
    const link = await this.parentStudentRepo.findOne({
      where: { parentUserId, studentId },
      relations: [
        'student',
        'student.enrollments',
        'student.enrollments.classLevel',
        'student.enrollments.academicYear',
        'student.enrollments.section',
      ],
    });
    if (!link) throw new NotFoundException('Linked student not found.');
    return link;
  }
}
