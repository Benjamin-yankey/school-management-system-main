import {
  BadRequestException,
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
import { AssignStudentSectionDto } from './dto/assign-student-section.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UpdateStudentStatusDto } from './dto/update-student-status.dto';
import { UserShadow, ProfileShadow } from './user-shadow.entity';

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
    @InjectRepository(UserShadow)
    private readonly userShadowRepo: Repository<UserShadow>,
    @InjectRepository(ProfileShadow)
    private readonly profileShadowRepo: Repository<ProfileShadow>,
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

    // 6. Section capacity enforcement
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

    // 3. Check for existing student from same applicant
    const existingStudent = await this.studentRepo.findOneBy({ applicantId: dto.applicantId });
    if (existingStudent) throw new BadRequestException('This applicant is already enrolled as a student');

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

    // 7. Check for duplicate enrollment in same academic year (Fix 7: Include studentId)
    const duplicateEnrollment = await this.enrollmentRepo.findOne({
      where: { 
        studentId: student.id, 
        academicYearId: dto.academicYearId 
      },
    });
    if (duplicateEnrollment) {
      throw new BadRequestException('Student is already enrolled for this academic year');
    }

    // 8. Create enrollment
    await this.enrollmentRepo.save(
      this.enrollmentRepo.create({
        studentId: student.id,
        classLevelId: dto.classLevelId,
        academicYearId: dto.academicYearId,
        sectionId: dto.sectionId ?? null,
      }),
    );

    // 10. Link to parent if provided
    if (dto.parentUserId) {
      await this.parentStudentRepo.save(
        this.parentStudentRepo.create({
          parentUserId: dto.parentUserId,
          studentId: student.id,
          relationship: dto.relationship || null,
        }),
      );
    }

    // 9. Update applicant status to enrolled
    await this.applicationRepo.update(applicant.id, { status: ApplicationStatus.ENROLLED });

    return this.findOne(student.id);
  }

  async assignToSection(studentId: string, dto: AssignStudentSectionDto): Promise<Student> {
    // 1. Ensure Student record exists (or create one for manual user creations)
    let student = await this.studentRepo.findOne({
      where: [{ id: studentId }, { email: studentId }], // Check by UUID or possibly email if passed
    });

    if (!student) {
      // 1b. Check if this is a manual User creation from user-service
      const user = await this.userShadowRepo.findOneBy({ id: studentId });
      if (!user) {
        throw new NotFoundException('Student record not found in school registry, and no corresponding user account found.');
      }
      if (user.role !== 'student') {
        throw new BadRequestException(`User ${user.email} exists but has role "${user.role}". Only students can be enrolled.`);
      }

      // Fetch profile for name details
      const profile = await this.profileShadowRepo.findOneBy({ userId: user.id });

      // Generate student ID
      const count = await this.studentRepo.count();
      const year = new Date().getFullYear();
      const generatedId = `STU-M-${year}-${String(count + 1).padStart(4, '0')}`;

      // Create Student record lazily
      student = await this.studentRepo.save(
        this.studentRepo.create({
          id: user.id, // Keep IDs synced
          studentId: generatedId,
          firstName: profile?.firstName || 'Unknown',
          lastName: profile?.lastName || 'Student',
          middleName: profile?.middleName || null,
          email: user.email,
          phoneNumber: profile?.phone || 'N/A',
        }),
      );
    }

    // 2. Validate class level and academic year
    await this.classesService.findClassLevelById(dto.classLevelId);
    await this.classesService.getAcademicYearOrFail(dto.academicYearId);

    // 3. Section capacity enforcement
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

    // 4. Check for existing enrollment in this year
    let enrollment = await this.enrollmentRepo.findOne({
      where: { studentId: student.id, academicYearId: dto.academicYearId },
    });

    if (enrollment) {
      // Update existing
      enrollment.classLevelId = dto.classLevelId;
      enrollment.sectionId = dto.sectionId ?? null;
      enrollment.isRepeating = dto.isRepeating ?? enrollment.isRepeating;
      await this.enrollmentRepo.save(enrollment);
    } else {
      // Create new enrollment record
      await this.enrollmentRepo.save(
        this.enrollmentRepo.create({
          studentId: student.id,
          classLevelId: dto.classLevelId,
          academicYearId: dto.academicYearId,
          sectionId: dto.sectionId ?? null,
          isRepeating: dto.isRepeating ?? false,
        }),
      );
    }

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
