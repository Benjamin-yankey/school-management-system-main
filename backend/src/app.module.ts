import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { APP_GUARD } from '@nestjs/core';

import { JwtStrategy } from './jwt.strategy';
import { BlacklistGuard } from './notification-domain/common/guards/blacklist.guard';

// ── Entities (one connection; each entity carries its own `schema`) ──────────
import { Credential } from './auth-domain/auth/credential.entity';
import { User } from './user-domain/user/user.entity';
import { Profile } from './user-domain/user/profile.entity';
import { EmailLog } from './notification-domain/notification/email-log.entity';
import { Notification } from './notification-domain/notification/notification.entity';
import { School } from './school-domain/school/school.entity';
import { AdmissionYear } from './school-domain/admission/admission-year.entity';
import { Application } from './school-domain/admission/application.entity';
import { ClassLevel } from './school-domain/classes/class-level.entity';
import { Section } from './school-domain/classes/section.entity';
import { AcademicYear } from './school-domain/classes/academic-year.entity';
import { AcademicTerm } from './school-domain/classes/academic-term.entity';
import { Student } from './school-domain/student/student.entity';
import { StudentEnrollment } from './school-domain/student/student-enrollment.entity';
import { TeacherSection } from './school-domain/teacher/teacher-section.entity';
import { ParentStudent } from './school-domain/parent/parent-student.entity';
import { Attendance } from './school-domain/attendance/attendance.entity';
import { Grade } from './school-domain/grade/grade.entity';
import { Fee } from './school-domain/fee/fee.entity';

// ── Feature modules ──────────────────────────────────────────────────────────
import { AuthModule } from './auth-domain/auth/auth.module';
import { UserModule } from './user-domain/user/user.module';
import { SeederModule } from './user-domain/seeder/seeder.module';
import { NotificationModule } from './notification-domain/notification/notification.module';
import { SchoolModule } from './school-domain/school/school.module';
import { AdmissionModule } from './school-domain/admission/admission.module';
import { ClassesModule } from './school-domain/classes/classes.module';
import { StudentModule } from './school-domain/student/student.module';
import { PromotionModule } from './school-domain/promotion/promotion.module';
import { TeacherModule } from './school-domain/teacher/teacher.module';
import { StudentPortalModule } from './school-domain/student-portal/student-portal.module';
import { ParentModule } from './school-domain/parent/parent.module';
import { AttendanceModule } from './school-domain/attendance/attendance.module';
import { GradeModule } from './school-domain/grade/grade.module';
import { FeeModule } from './school-domain/fee/fee.module';

const ENTITIES = [
  Credential,
  User,
  Profile,
  EmailLog,
  Notification,
  School,
  AdmissionYear,
  Application,
  ClassLevel,
  Section,
  AcademicYear,
  AcademicTerm,
  Student,
  StudentEnrollment,
  TeacherSection,
  ParentStudent,
  Attendance,
  Grade,
  Fee,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: ENTITIES,
        synchronize: true,
      }),
    }),

    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),

    // Feature modules
    AuthModule,
    UserModule,
    SeederModule,
    NotificationModule,
    SchoolModule,
    AdmissionModule,
    ClassesModule,
    StudentModule,
    PromotionModule,
    TeacherModule,
    StudentPortalModule,
    ParentModule,
    AttendanceModule,
    GradeModule,
    FeeModule,
  ],
  providers: [
    JwtStrategy,
    BlacklistGuard,
    // Token-revocation check on every request (replaces the API gateway's BlacklistGuard).
    { provide: APP_GUARD, useClass: BlacklistGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
