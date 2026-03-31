import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Section } from './section.entity';

export enum SchoolLevel {
  PRIMARY = 'primary',
  JHS = 'jhs',
  SHS = 'shs',
}

@Entity({ name: 'class_levels', schema: 'school' })
export class ClassLevel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string; // e.g. "Primary 1", "JHS 2", "SHS 3"

  @Column({ type: 'enum', enum: SchoolLevel })
  level: SchoolLevel;

  @Column()
  order: number; // 1-12, used for promotion logic

  @OneToMany(() => Section, (s) => s.classLevel)
  sections: Section[];
}
