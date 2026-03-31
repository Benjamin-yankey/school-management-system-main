import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum FeeType {
  TUITION = 'tuition',
  REGISTRATION = 'registration',
  EXAM = 'exam',
  SPORTS = 'sports',
  OTHER = 'other',
}

export enum FeeStatus {
  PENDING = 'pending',
  PARTIAL = 'partial',
  PAID = 'paid',
  WAIVED = 'waived',
}

@Entity({ name: 'fees', schema: 'school' })
export class Fee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  termId: string;

  @Column({ type: 'enum', enum: FeeType })
  feeType: FeeType;

  @Column({ type: 'float' })
  amountDue: number;

  @Column({ type: 'float', default: 0 })
  amountPaid: number;

  @Column({ type: 'enum', enum: FeeStatus, default: FeeStatus.PENDING })
  status: FeeStatus;

  @Column({ nullable: true })
  reference: string;

  @Column({ nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;
}
