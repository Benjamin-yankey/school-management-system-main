import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from './student.entity';
import { StudentEnrollment } from './student-enrollment.entity';
import { Application, ApplicationStatus } from '../admission/application.entity';
import { ClassesService } from '../classes/classes.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    private readonly classesService: ClassesService,
  ) {}

  async enroll(dto: EnrollStudentDto): Promise<Student> {
    // 1. Validate applicant
    const applicant = await this.applicationRepo.findOneBy({ id: dto.applicantId });
    if (!applicant) throw new NotFoundException('Applicant not found');
    if (applicant.status !== ApplicationStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted applicants can be enrolled');
    }

    // 2. Validate class level and academic year
    const classLevel = await this.classesService.findClassLevelById(dto.classLevelId);
    await this.classesService.getAcademicYearOrFail(dto.academicYearId);

    // 3. Check for existing student from same applicant
    const existingStudent = await this.studentRepo.findOneBy({ applicantId: dto.applicantId });
    if (existingStudent) throw new BadRequestException('This applicant is already enrolled as a student');

    // 4. Check for duplicate enrollment in same academic year
    const duplicateEnrollment = await this.enrollmentRepo.findOne({
      where: { classLevelId: dto.classLevelId, academicYearId: dto.academicYearId },
    });

    // 5. Generate student ID
    const count = await this.studentRepo.count();
    const year = new Date().getFullYear();
    const studentId = `STU-${year}-${String(count + 1).padStart(4, '0')}`;

    // 6. Create student
    const student = await this.studentRepo.save(
      this.studentRepo.create({
        studentId,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        middleName: applicant.middleName,
        email: applicant.email,
        phoneNumber: applicant.phoneNumber,
        dateOfBirth: applicant.dateOfBirth,
        areaOfInterest: applicant.areaOfInterest,
        applicantId: applicant.id,
      }),
    );

    // 7. Create enrollment
    await this.enrollmentRepo.save(
      this.enrollmentRepo.create({
        studentId: student.id,
        classLevelId: dto.classLevelId,
        academicYearId: dto.academicYearId,
        sectionId: dto.sectionId ?? null,
      }),
    );

    // 8. Update applicant status to enrolled
    await this.applicationRepo.update(applicant.id, { status: ApplicationStatus.ENROLLED });

    return this.findOne(student.id);
  }

  findAll(): Promise<Student[]> {
    return this.studentRepo.find({
      relations: ['enrollments', 'enrollments.classLevel', 'enrollments.academicYear', 'enrollments.section', 'parents'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['enrollments', 'enrollments.classLevel', 'enrollments.academicYear', 'enrollments.section', 'parents'],
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async getEnrollmentHistory(studentId: string): Promise<StudentEnrollment[]> {
    await this.findOne(studentId);
    return this.enrollmentRepo.find({
      where: { studentId },
      relations: ['classLevel', 'academicYear', 'section'],
      order: { enrolledAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateStudentDto): Promise<Student> {
    await this.findOne(id);
    await this.studentRepo.update(id, dto);
    return this.findOne(id);
  }

  async updateStatus(id: string, dto: UpdateStudentStatusDto): Promise<Student> {
    await this.findOne(id);
    await this.studentRepo.update(id, { status: dto.status });
    return this.findOne(id);
  }
}
