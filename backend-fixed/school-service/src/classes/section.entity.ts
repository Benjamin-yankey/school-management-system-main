import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ClassLevel } from './class-level.entity';

@Entity({ name: 'sections', schema: 'school' })
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "A", "B", "C"

  @Column()
  academicYearId: string;

  @Column({ nullable: true })
  capacity: number;

  @ManyToOne(() => ClassLevel, (cl) => cl.sections, { eager: true })
  classLevel: ClassLevel;

  @Column()
  classLevelId: string;
}
