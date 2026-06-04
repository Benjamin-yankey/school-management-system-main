import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { ClassLevel } from '../classes/class-level.entity';
import { Section } from '../classes/section.entity';
import { AcademicYear } from '../classes/academic-year.entity';

export enum PromotionStatus {
  PENDING = 'pending',
  PROMOTED = 'promoted',
  REPEATED = 'repeated',
  GRADUATED = 'graduated',
}

@Entity({ name: 'student_enrollments', schema: 'school' })
export class StudentEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Student, (s) => s.enrollments, { onDelete: 'CASCADE' })
  student: Student;

  @Column()
  studentId: string;

  @ManyToOne(() => ClassLevel, { eager: true })
  classLevel: ClassLevel;

  @Column()
  classLevelId: string;

  @ManyToOne(() => Section, { eager: true, nullable: true })
  section: Section;

  @Column({ nullable: true })
  sectionId: string;

  @ManyToOne(() => AcademicYear, { eager: true })
  academicYear: AcademicYear;

  @Column()
  academicYearId: string;

  @Column({ default: false })
  isRepeating: boolean;

  @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.PENDING })
  promotionStatus: PromotionStatus;

  @CreateDateColumn()
  enrolledAt: Date;
}
