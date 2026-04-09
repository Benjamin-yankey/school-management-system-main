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

  @Column({ default: 'system' })
  category: string;

  @Column({ default: 'normal' })
  priority: string;

  @CreateDateColumn()
  createdAt: Date;
}
