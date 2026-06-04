import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity({ name: 'notifications', schema: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: false })
  read: boolean;

  @Column({ default: 'general' })
  category: string;

  @Column({ default: 'normal' })
  priority: string;

  @Column({ default: 'inApp' })
  channels: string;

  @Column({ nullable: true })
  groupName: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ default: false })
  scheduled: boolean;

  @Column({ default: false })
  sent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
