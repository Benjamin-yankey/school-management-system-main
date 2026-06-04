import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { AcademicYear } from './academic-year.entity';

@Entity({ name: 'academic_terms', schema: 'school' })
export class AcademicTerm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Term 1", "Term 2", "Term 3"

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ default: false })
  isCurrent: boolean;

  @Column()
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @CreateDateColumn()
  createdAt: Date;
}
