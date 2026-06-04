import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { ClassLevel } from './class-level.entity';
import { AcademicYear } from './academic-year.entity';

@Entity({ name: 'sections', schema: 'school' })
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "A", "B", "C"

  @Column()
  academicYearId: string;

  @ManyToOne(() => AcademicYear, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'academicYearId' })
  academicYear: AcademicYear;

  @Column({ nullable: true })
  capacity: number;

  @ManyToOne(() => ClassLevel, (cl) => cl.sections, { eager: true, onDelete: 'CASCADE' })
  classLevel: ClassLevel;

  @Column()
  classLevelId: string;
}
