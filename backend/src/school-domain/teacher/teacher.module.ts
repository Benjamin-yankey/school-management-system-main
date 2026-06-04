import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeacherSection } from './teacher-section.entity';
import { TeacherService } from './teacher.service';
import { TeacherController } from './teacher.controller';
import { Student } from '../student/student.entity';
import { StudentEnrollment } from '../student/student-enrollment.entity';
import { Section } from '../classes/section.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeacherSection, Section, Student, StudentEnrollment]),
  ],
  controllers: [TeacherController],
  providers: [TeacherService],
})
export class TeacherModule {}
