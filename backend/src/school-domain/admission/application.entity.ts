import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AdmissionYear } from './admission-year.entity';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  ENROLLED = 'enrolled',
}

@Entity({ name: 'applications', schema: 'school' })
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @ManyToOne(() => AdmissionYear, (year) => year.applications, { eager: true })
  admissionYear: AdmissionYear;

  @Column()
  admissionYearId: string;

  @CreateDateColumn()
  submittedAt: Date;
}
