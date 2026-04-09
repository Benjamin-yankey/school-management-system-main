import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'users', schema: 'user' })
export class UserShadow {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  role: string;

  @Column({ default: true })
  isActive: boolean;
}

@Entity({ name: 'profiles', schema: 'user' })
export class ProfileShadow {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;
}
