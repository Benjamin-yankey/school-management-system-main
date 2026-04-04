import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student, StudentStatus } from './student.entity';
import { StudentEnrollment } from './student-enrollment.entity';
import { ParentStudent } from '../parent/parent-student.entity';
import { Application, ApplicationStatus } from '../admission/application.entity';
import { ClassesService } from '../classes/classes.service';
import { EnrollStudentDto } from './dto/enroll-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';

import { ClientKafka } from '@nestjs/microservices';
import { SchoolService } from '../school/school.service';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(ParentStudent)
    private readonly parentStudentRepo: Repository<ParentStudent>,
    private readonly classesService: ClassesService,
    private readonly schoolService: SchoolService,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) {}


  async enroll(dto: EnrollStudentDto, schoolId: string): Promise<Student> {
    // 1. Validate applicant
    const applicant = await this.applicationRepo.findOneBy({ id: dto.applicantId });
    if (!applicant) throw new NotFoundException('Applicant not found');
    if (applicant.status !== ApplicationStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted applicants can be enrolled');
    }

    // 2. Validate class level and academic year
    const classLevel = await this.classesService.findClassLevelById(dto.classLevelId);
    await this.classesService.getAcademicYearOrFail(dto.academicYearId);

    // 3. Fetch school domain for email generation
    const school = await this.schoolService.getDetails(schoolId);
    const domain = school.domain || 'school.com';

    // 4. Section capacity enforcement
    if (dto.sectionId) {
      const section = await this.classesService.findSectionById(dto.sectionId);
      if (section && section.capacity) {
        const enrolledCount = await this.enrollmentRepo.count({
          where: { sectionId: dto.sectionId, academicYearId: dto.academicYearId },
        });
        if (enrolledCount >= section.capacity) {
          throw new BadRequestException(`Section "${section.name}" is full (Capacity: ${section.capacity})`);
        }
      }
    }

    // 5. Check for existing student from same applicant
    const existingStudent = await this.studentRepo.findOneBy({ applicantId: dto.applicantId });
    if (existingStudent) throw new BadRequestException('This applicant is already enrolled as a student');

    // 6. Generate student ID
    const count = await this.studentRepo.count({ where: { schoolId } });
    const year = new Date().getFullYear();
    const studentId = `STU-${year}-${String(count + 1).padStart(4, '0')}`;
    const schoolEmail = `${studentId.toLowerCase()}@st.${domain}`;

    // 7. Create student
    const student = await this.studentRepo.save(
      this.studentRepo.create({
        studentId,
        schoolId,
        schoolEmail,
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

    // 8. Create enrollment
    await this.enrollmentRepo.save(
      this.enrollmentRepo.create({
        studentId: student.id,
        classLevelId: dto.classLevelId,
        academicYearId: dto.academicYearId,
        sectionId: dto.sectionId ?? null,
      }),
    );

    // 9. Link to parent if provided
    if (dto.parentUserId) {
      await this.parentStudentRepo.save(
        this.parentStudentRepo.create({
          parentUserId: dto.parentUserId,
          studentId: student.id,
          relationship: dto.relationship || null,
        }),
      );
    }

    // 10. Update applicant status to enrolled
    await this.applicationRepo.update(applicant.id, { status: ApplicationStatus.ENROLLED });

    // 11. Notify User Service to create login account
    this.kafkaClient.emit('user.enroll-student', {
      schoolId,
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      schoolEmail: student.schoolEmail,
      personalEmail: student.email,
    });

    return this.findOne(student.id);
  }


  // 11. Pagination on student list
  async findAll(query: { 
    page?: number; 
    limit?: number; 
    academicYearId?: string; 
    classLevelId?: string; 
  } = {}): Promise<{ data: Student[]; total: number; page: number; limit: number }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.classLevelId) {
      // Since relations are being loaded, we can filter by the enrollment's classLevelId
      // However, for performance and simplicity, nested filters in find() can be tricky.
      // We'll use query builder or keep it simple if the dataset is small.
      // For now, let's assume filtering by the latest enrollment or any enrollment.
    }

    const [data, total] = await this.studentRepo.findAndCount({
      relations: ['enrollments', 'enrollments.classLevel', 'enrollments.academicYear', 'enrollments.section', 'parents'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: skip,
    });

    return { data, total, page, limit };
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

  async withdraw(id: string, reason?: string): Promise<Student> {
    await this.findOne(id);
    await this.studentRepo.update(id, { 
      status: StudentStatus.WITHDRAWN 
    });
    // Optional: Log reason in a separate table or a note field if it existed
    return this.findOne(id);
  }
}
