import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.entity';
import { Credential } from './credential-seed.entity';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User, 'seeder')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Credential, 'seeder')
    private readonly credentialRepo: Repository<Credential>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const exists = await this.userRepo.findOneBy({ role: 'superadmin' });
    if (exists) {
      this.logger.log('Superadmin already exists — skipping seed.');
      return;
    }

    const email = this.config.get<string>('SUPERADMIN_EMAIL');
    const password = this.config.get<string>('SUPERADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.error('SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD missing — skipping seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepo.save(
      this.userRepo.create({ email, role: 'superadmin', isActive: true }),
    );

    await this.credentialRepo.save(
      this.credentialRepo.create({ userId: user.id, hashedPassword, mustResetPassword: false }),
    );

    this.logger.log(`Superadmin seeded: ${email}`);
  }
}
