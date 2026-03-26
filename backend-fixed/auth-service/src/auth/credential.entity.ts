import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'credentials', schema: 'auth' })
export class Credential {
  @PrimaryColumn('uuid')
  userId: string;

  @Column('text')
  hashedPassword: string;

  @Column({ default: false })
  mustResetPassword: boolean;
}
