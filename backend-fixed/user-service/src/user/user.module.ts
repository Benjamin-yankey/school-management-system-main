import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserInternalController } from './user.internal.controller';
import { JwtStrategy } from './jwt.strategy';
import { ScopeGuard } from '../common/guards/scope.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  controllers: [UserController, UserInternalController],
  providers: [UserService, JwtStrategy, ScopeGuard],
})
export class UserModule {}
