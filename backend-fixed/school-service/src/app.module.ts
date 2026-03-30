import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

import { School } from './school/school.entity';
import { AdmissionYear } from './admission/admission-year.entity';
import { Application } from './admission/application.entity';
import { ClassLevel } from './classes/class-level.entity';
import { Section } from './classes/section.entity';
import { AcademicYear } from './classes/academic-year.entity';
import { Student } from './student/student.entity';
import { StudentEnrollment } from './student/student-enrollment.entity';

import { SchoolModule } from './school/school.module';
import { AdmissionModule } from './admission/admission.module';
import { ClassesModule } from './classes/classes.module';
import { StudentModule } from './student/student.module';
import { PromotionModule } from './promotion/promotion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        schema: 'school',
        entities: [
          School,
          AdmissionYear,
          Application,
          ClassLevel,
          Section,
          AcademicYear,
          Student,
          StudentEnrollment,
        ],
        synchronize: true,
      }),
    }),

    PassportModule,
    PrometheusModule.register({ path: '/metrics', defaultMetrics: { enabled: true } }),

    SchoolModule,
    AdmissionModule,
    ClassesModule,
    StudentModule,
    PromotionModule,
  ],
})
export class AppModule {}
