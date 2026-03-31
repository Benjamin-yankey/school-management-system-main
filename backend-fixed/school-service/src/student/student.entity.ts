import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StudentEnrollment } from './student-enrollment.entity';
import { ParentStudent } from '../parent/parent-student.entity';

export enum StudentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn',
  REPEATED = 'repeated',
}

@Entity({ name: 'students', schema: 'school' })
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentId: string; // e.g. STU-2025-0001

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'date' })
  dateOfBirth: string;

  @Column()
  areaOfInterest: string;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Column({ nullable: true })
  applicantId: string; // reference back to the application

  @OneToMany(() => StudentEnrollment, (e) => e.student)
  enrollments: StudentEnrollment[];

  @OneToMany(() => ParentStudent, (ps) => ps.student)
  parents: ParentStudent[];

  @CreateDateColumn()
  createdAt: Date;
}
