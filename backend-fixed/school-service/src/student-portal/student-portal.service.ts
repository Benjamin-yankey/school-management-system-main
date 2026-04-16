import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../student/student.entity';
import { StudentEnrollment } from '../student/student-enrollment.entity';
import { StudentService } from '../student/student.service';

@Injectable()
export class StudentPortalService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
    private readonly studentService: StudentService,
  ) {}

  /**
   * Resolve student record from the JWT user's email.
   * When a student account is created via administration/create-user, the email
   * matches the email stored on the Student record from the admission application.
   */
  async getMyRecord(userEmail: string, userId: string): Promise<Student> {
    let student = await this.studentRepo.findOne({
      where: [{ email: userEmail }, { id: userId }],
      relations: [
        'enrollments',
        'enrollments.classLevel',
        'enrollments.academicYear',
        'enrollments.section',
      ],
    });

    if (!student && userId) {
      // Lazily create student from user account
      try {
        student = await this.studentService.createFromUser(userId);
      } catch (err) {
        // Fallback to error if lazy creation fails
      }
    }

    if (!student) {
      throw new NotFoundException(
        'No student record found for your account. Contact your school administrator.',
      );
    }
    return student;
  }

  async getMyEnrollments(userEmail: string, userId: string): Promise<StudentEnrollment[]> {
    let student = await this.studentRepo.findOne({
      where: [{ email: userEmail }, { id: userId }],
    });

    if (!student && userId) {
      try {
        student = await this.studentService.createFromUser(userId);
      } catch (err) {
        // Fallback
      }
    }

    if (!student) {
      throw new NotFoundException(
        'No student record found for your account. Contact your school administrator.',
      );
    }

    return this.enrollmentRepo.find({
      where: { studentId: student.id },
      relations: ['classLevel', 'academicYear', 'section'],
      order: { enrolledAt: 'DESC' },
    });
  }
}
