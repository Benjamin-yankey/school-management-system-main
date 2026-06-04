import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'schools', schema: 'school' })
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'Enterprise Pro' })
  subscriptionPlan: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 149.00 })
  subscriptionAmount: number;

  @Column({ default: 'Paid' })
  subscriptionStatus: string;

  @Column({ nullable: true })
  nextChargeDate: Date;

  @Column({ default: 'Visa ending in 4242' })
  paymentMethod: string;

  @CreateDateColumn()
  createdAt: Date;
}
