import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'grades', schema: 'school' })
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
  subject: string;

  @Column({ type: 'float' })
  score: number;

  @Column()
  remark: string;

  @Column({ nullable: true })
  teacherNote: string;

  @CreateDateColumn()
  createdAt: Date;
}
