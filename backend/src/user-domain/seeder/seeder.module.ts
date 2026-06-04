import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { User } from '../user/user.entity';
import { Profile } from '../user/profile.entity';
import { Credential } from '../../auth-domain/auth/credential.entity';

@Module({
  // Uses the single default connection; entities span the user/auth schemas.
  imports: [TypeOrmModule.forFeature([User, Profile, Credential])],
  providers: [SeederService],
})
export class SeederModule {}
