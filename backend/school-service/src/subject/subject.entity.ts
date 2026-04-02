import {
    Column,
    Entity,
    ManyToOne,
    JoinColumn,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { ClassLevel } from '../classes/class-level.entity';

@Entity({ name: 'subjects', schema: 'school' })
@Unique(['name', 'classLevelId'])
export class Subject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // e.g. "Mathematics", "English Language"

    @Column()
    classLevelId: string;

    @ManyToOne(() => ClassLevel, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'classLevelId' })
    classLevel: ClassLevel;
}