import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'academic_years', schema: 'school' })
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  year: string; // e.g. "2025/2026"

  @Column({ default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
