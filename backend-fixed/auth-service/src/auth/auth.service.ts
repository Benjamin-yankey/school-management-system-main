import {
  Inject,
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ClientKafka } from '@nestjs/microservices';
import { timeout } from 'rxjs/operators';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Credential } from './credential.entity';
import { SignInDto } from './dto/signin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenBlacklistService } from './token-blacklist.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepo: Repository<Credential>,
    private readonly jwtService: JwtService,
    private readonly blacklist: TokenBlacklistService,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('user.find-by-email');
    await this.kafkaClient.connect();
  }

  async signIn(dto: SignInDto): Promise<{ accessToken: string }> {
    const email = dto.email.toLowerCase();
    console.log(`[AuthService] Attempting signIn for: ${email}`);

    const user = await this.kafkaClient
      .send('user.find-by-email', { email })
      .pipe(timeout(15000))
      .toPromise()
      .catch((err) => {
        console.error(`[AuthService] user-service lookup failed for ${email}:`, err);
        if (err.name === 'TimeoutError') throw new ServiceUnavailableException();
        throw err;
      });

    if (!user) {
      console.warn(`[AuthService] User not found: ${email}`);
      throw new UnauthorizedException();
    }
    if (!user.isActive) {
      console.warn(`[AuthService] User inactive: ${email}`);
      throw new UnauthorizedException();
    }

    const credential = await this.credentialRepo.findOneBy({ userId: user.id });
    if (!credential) {
      console.error(`[AuthService] Credentials missing for userId: ${user.id}`);
      throw new UnauthorizedException();
    }

    const valid = await bcrypt.compare(dto.password, credential.hashedPassword);
    if (!valid) {
      console.warn(`[AuthService] Password mismatch for: ${email}`);
      throw new UnauthorizedException();
    }

    console.log(`[AuthService] Successful login for: ${email}`);
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      mustResetPassword: credential.mustResetPassword,
      jti: crypto.randomUUID(),
    });

    return { accessToken };
  }

  async signOut(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as { jti: string; exp: number };
    if (decoded?.jti) await this.blacklist.revoke(decoded.jti, decoded.exp);
  }

  async firstLoginReset(userId: string, currentToken: string, dto: ChangePasswordDto): Promise<void> {
    const credential = await this.credentialRepo.findOneBy({ userId });
    if (!credential) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, credential.hashedPassword);
    if (!valid) throw new UnauthorizedException();

    credential.hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    credential.mustResetPassword = false;
    await this.credentialRepo.save(credential);
    await this.signOut(currentToken);
  }

  async changePassword(userId: string, currentToken: string, dto: ChangePasswordDto): Promise<void> {
    const credential = await this.credentialRepo.findOneBy({ userId });
    if (!credential) throw new UnauthorizedException();

    const valid = await bcrypt.compare(dto.currentPassword, credential.hashedPassword);
    if (!valid) throw new UnauthorizedException();

    credential.hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.credentialRepo.save(credential);
    await this.signOut(currentToken);
  }

  async verifyPassword(userId: string, plainPassword: string): Promise<{ valid: boolean }> {
    const credential = await this.credentialRepo.findOneBy({ userId });
    if (!credential) return { valid: false };
    const valid = await bcrypt.compare(plainPassword, credential.hashedPassword);
    return { valid };
  }

  async createCredential(data: {
    userId: string;
    hashedPassword: string;
    mustResetPassword: boolean;
  }): Promise<void> {
    const credential = this.credentialRepo.create(data);
    await this.credentialRepo.save(credential);
  }

  async updateCredential(data: {
    userId: string;
    hashedPassword?: string;
    mustResetPassword?: boolean;
  }): Promise<void> {
    await this.credentialRepo.update({ userId: data.userId }, {
      ...(data.hashedPassword && { hashedPassword: data.hashedPassword }),
      ...(data.mustResetPassword !== undefined && { mustResetPassword: data.mustResetPassword }),
    });
  }
}
