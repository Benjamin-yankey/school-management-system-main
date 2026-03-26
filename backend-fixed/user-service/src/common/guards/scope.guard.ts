import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../user/user.entity';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const targetId = req.params?.id;
    if (!targetId) return true;

    const target = await this.userRepo.findOneBy({ id: targetId });
    if (!target) return true;

    // req.user.id comes from JWT (sub claim); schoolId is NOT in the JWT — look it up from DB
    const requestingUser = await this.userRepo.findOneBy({ id: req.user?.id });
    if (!requestingUser) throw new ForbiddenException('Access denied.');

    if (target.schoolId !== requestingUser.schoolId) {
      throw new ForbiddenException('Access denied: outside your school scope.');
    }
    return true;
  }
}
