import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ScopeGuard } from '../common/guards/scope.guard';
import { School } from '../../school-domain/school/school.entity';
import { AuthModule } from '../../auth-domain/auth/auth.module';
import { NotificationModule } from '../../notification-domain/notification/notification.module';

@Module({
  imports: [
    // School entity is read directly (school existence check) — no module coupling.
    TypeOrmModule.forFeature([User, Profile, School]),
    forwardRef(() => AuthModule),
    NotificationModule,
  ],
  controllers: [UserController],
  providers: [UserService, ScopeGuard],
  exports: [UserService],
})
export class UserModule {}
