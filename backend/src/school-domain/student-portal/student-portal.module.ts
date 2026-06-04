import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/student.entity';
import { StudentEnrollment } from '../student/student-enrollment.entity';
import { StudentPortalService } from './student-portal.service';
import { StudentPortalController } from './student-portal.controller';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, StudentEnrollment]),
    StudentModule,
  ],
  controllers: [StudentPortalController],
  providers: [StudentPortalService],
})
export class StudentPortalModule {}
