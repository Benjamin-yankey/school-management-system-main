import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../student/student.entity';

@Entity({ name: 'parent_students', schema: 'school' })
export class ParentStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  parentUserId: string; // userId from user-service JWT

  @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
  student: Student;

  @Column()
  studentId: string;

  @Column({ nullable: true })
  relationship: string; // e.g. "mother", "father", "guardian"

  @CreateDateColumn()
  linkedAt: Date;
}
