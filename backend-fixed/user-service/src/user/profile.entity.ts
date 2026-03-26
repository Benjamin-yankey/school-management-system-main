import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'profiles', schema: 'user' })
export class Profile {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;
}
