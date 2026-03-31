import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentEnrollment } from './student-enrollment.entity';
import { Application } from '../admission/application.entity';
import { ParentStudent } from '../parent/parent-student.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, StudentEnrollment, Application, ParentStudent]),
    ClassesModule,
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
