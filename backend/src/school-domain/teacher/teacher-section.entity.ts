import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Section } from '../classes/section.entity';

@Entity({ name: 'teacher_sections', schema: 'school' })
export class TeacherSection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  teacherUserId: string; // userId from user-service JWT

  @ManyToOne(() => Section, { eager: true, onDelete: 'CASCADE' })
  section: Section;

  @Column()
  sectionId: string;

  @CreateDateColumn()
  assignedAt: Date;
}
