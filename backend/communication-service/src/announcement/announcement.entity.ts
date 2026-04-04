import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AnnouncementAudience = 'all' | 'teachers' | 'students' | 'parents' | 'administration';

@Entity({ name: 'announcements', schema: 'communication' })
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  schoolId: string;

  @Column()
  authorId: string;

  @Column()
  authorRole: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'varchar', default: 'all' })
  audience: AnnouncementAudience;

  // Optional: pin to top of feed
  @Column({ default: false })
  pinned: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
