import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../student/student.entity';
import { StudentEnrollment } from '../student/student-enrollment.entity';

@Injectable()
export class StudentPortalService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(StudentEnrollment)
    private readonly enrollmentRepo: Repository<StudentEnrollment>,
  ) {}

  /**
   * Resolve student record from the JWT user's email.
   * When a student account is created via administration/create-user, the email
   * matches the email stored on the Student record from the admission application.
   */
  async getMyRecord(userEmail: string): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { email: userEmail },
      relations: [
        'enrollments',
        'enrollments.classLevel',
        'enrollments.academicYear',
        'enrollments.section',
      ],
    });
    if (!student) {
      throw new NotFoundException(
        'No student record found for your account. Contact your school administrator.',
      );
    }
    return student;
  }

  async getMyEnrollments(userEmail: string): Promise<StudentEnrollment[]> {
    const student = await this.studentRepo.findOneBy({ email: userEmail });
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
