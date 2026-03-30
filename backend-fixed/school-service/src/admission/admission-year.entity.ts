import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Application } from './application.entity';

@Entity({ name: 'admission_years', schema: 'school' })
export class AdmissionYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  year: string; // e.g. "2025/2026"

  @Column({ default: false })
  isOpen: boolean;

  @OneToMany(() => Application, (app) => app.admissionYear)
  applications: Application[];

  @CreateDateColumn()
  createdAt: Date;
}
