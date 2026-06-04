import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'email_logs', schema: 'notification' })
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column({ type: 'varchar' })
  status: 'sent' | 'failed';

  @Column({ nullable: true, type: 'text' })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
