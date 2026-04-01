import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @Inject('KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('auth.verify-password');
    this.kafkaClient.subscribeToResponseOf('school.validate');
    await this.kafkaClient.connect();
  }

  // ── Kafka helpers ──────────────────────────────────────────────────────────

  private async kafkaRequest<T>(topic: string, payload: any): Promise<T> {
    return this.kafkaClient
      .send(topic, payload)
      .pipe(timeout(5000))
      .toPromise()
      .catch((err) => {
        if (err.name === 'TimeoutError') throw new ServiceUnavailableException();
        throw err;
      });
  }

  private generateTempPassword(): string {
    return crypto.randomBytes(8).toString('hex');
  }

  // ── Resolve schoolId from userId (JWT does not carry schoolId) ─────────────

  async getSchoolIdForUser(userId: string): Promise<string> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found.');
    return user.schoolId;
  }

  // ── Superadmin ─────────────────────────────────────────────────────────────

  async createAdministration(dto: CreateAdministrationDto) {
    const { exists } = await this.kafkaRequest<{ exists: boolean }>('school.validate', {
      schoolId: dto.schoolId,
    });
    if (!exists) throw new BadRequestException('School not found.');

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.userRepo.save(
      this.userRepo.create({ email: dto.email, role: 'administration', schoolId: dto.schoolId, isActive: true }),
    );
    await this.profileRepo.save(this.profileRepo.create({ userId: user.id }));

    this.kafkaClient.emit('auth.credentials-create', { userId: user.id, hashedPassword, mustResetPassword: true });
    this.kafkaClient.emit('notification.email', { type: 'welcome', to: dto.email, tempPassword });

    return { id: user.id, email: user.email, role: user.role };
  }

  async resetAdminPassword(id: string) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException();

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    this.kafkaClient.emit('auth.credentials-update', { userId: id, hashedPassword, mustResetPassword: true });
    this.kafkaClient.emit('notification.email', { type: 'password-reset', to: user.email, tempPassword });
  }

  async listAdministrations() {
    return this.userRepo.findBy({ role: 'administration' });
  }

  async deactivateUser(id: string) {
    await this.userRepo.update(id, { isActive: false });
  }

  async updateSuperadminCredentials(userId: string, dto: UpdateCredentialsDto) {
    const { valid } = await this.kafkaRequest<{ valid: boolean }>('auth.verify-password', {
      userId,
      plainPassword: dto.currentPassword,
    });
    if (!valid) throw new ForbiddenException('Current password is incorrect.');

    if (dto.newEmail) {
      await this.userRepo.update(userId, { email: dto.newEmail });
    }
    if (dto.newPassword) {
      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
      this.kafkaClient.emit('auth.credentials-update', { userId, hashedPassword });
    }
  }

  // ── Administration ─────────────────────────────────────────────────────────

  async createUser(dto: CreateUserDto, requestingUserId: string) {
    // schoolId is not in the JWT — resolve it from the DB
    const schoolId = await this.getSchoolIdForUser(requestingUserId);

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.userRepo.save(
      this.userRepo.create({ email: dto.email, role: dto.role, schoolId, isActive: true }),
    );
    await this.profileRepo.save(this.profileRepo.create({ userId: user.id }));

    this.kafkaClient.emit('auth.credentials-create', { userId: user.id, hashedPassword, mustResetPassword: true });
    this.kafkaClient.emit('notification.email', { type: 'welcome', to: dto.email, tempPassword });

    return { id: user.id, email: user.email, role: user.role };
  }

  async resetUserPassword(id: string, requestingUserId: string) {
    const schoolId = await this.getSchoolIdForUser(requestingUserId);

    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException();
    if (user.schoolId !== schoolId) throw new ForbiddenException();

    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    this.kafkaClient.emit('auth.credentials-update', { userId: id, hashedPassword, mustResetPassword: true });
    this.kafkaClient.emit('notification.email', { type: 'password-reset', to: user.email, tempPassword });
  }

  async listSchoolUsers(requestingUserId: string) {
    const schoolId = await this.getSchoolIdForUser(requestingUserId);
    return this.userRepo.findBy({ schoolId });
  }

  async deactivateSchoolUser(id: string, requestingUserId: string) {
    const schoolId = await this.getSchoolIdForUser(requestingUserId);

    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException();
    if (user.schoolId !== schoolId) throw new ForbiddenException();
    await this.userRepo.update(id, { isActive: false });
  }

  async activateUser(id: string) {
    await this.userRepo.update(id, { isActive: true });
  }

  async activateSchoolUser(id: string, requestingUserId: string) {
    const schoolId = await this.getSchoolIdForUser(requestingUserId);

    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException();
    if (user.schoolId !== schoolId) throw new ForbiddenException();
    await this.userRepo.update(id, { isActive: true });
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    const profile = await this.profileRepo.findOneBy({ userId });
    return { ...user, ...profile };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.profileRepo.update({ userId }, dto);
    return this.getProfile(userId);
  }

  // ── Kafka: find by email (consumed by Auth Service) ────────────────────────

  async findByEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email: email.toLowerCase() });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      mustResetPassword: null, // auth-service owns this — returned as null, auth-service checks its own table
    };
  }
}
