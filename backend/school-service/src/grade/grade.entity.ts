import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Subject } from '../subject/subject.entity';

@Entity({ name: 'grades', schema: 'school' })
@Unique(['studentId', 'termId', 'subjectId']) // one grade per student per subject per term
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  termId: string;

  @Column()
  classLevelId: string;

  @Column()
  subjectId: string;

  @ManyToOne(() => Subject, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;

  @Column({ type: 'float' })
  score: number;

  @Column()
  remark: string;

  @Column({ nullable: true })
  teacherNote: string;

  @CreateDateColumn()
  createdAt: Date;
}