import { Column, Entity, PrimaryColumn } from 'typeorm';

// Used ONLY by SeederService — the single documented cross-schema write.
// No other code in user-service may reference this entity.
@Entity({ name: 'credentials', schema: 'auth' })
export class Credential {
  @PrimaryColumn('uuid')
  userId: string;

  @Column('text')
  hashedPassword: string;

  @Column({ default: false })
  mustResetPassword: boolean;
}
