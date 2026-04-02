import { Column, CreateDateColumn, Entity, ManyToOne, JoinColumn, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Application } from './application.entity';
import { AcademicYear } from '../classes/academic-year.entity';

@Entity({ name: 'admission_years', schema: 'school' })
export class AdmissionYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  year: string; // display name e.g. "2025/2026"

  @Column()
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { eager: true })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column({ default: false })
  isOpen: boolean;

  @OneToMany(() => Application, (app) => app.admissionYear)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;
}
