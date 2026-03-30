import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../student/student.entity';
import { StudentEnrollment } from '../student/student-enrollment.entity';
import { StudentPortalService } from './student-portal.service';
import { StudentPortalController } from './student-portal.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudentEnrollment])],
  controllers: [StudentPortalController],
  providers: [StudentPortalService],
})
export class StudentPortalModule {}
