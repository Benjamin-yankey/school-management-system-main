import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentEnrollment } from './student-enrollment.entity';
import { Application } from '../admission/application.entity';
import { ParentStudent } from '../parent/parent-student.entity';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { ClassesModule } from '../classes/classes.module';
import { SchoolModule } from '../school/school.module';

import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, StudentEnrollment, Application, ParentStudent]),
    ClassesModule,
    SchoolModule,

    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'school-service-producer', brokers: [process.env.KAFKA_BROKER] },
          consumer: { groupId: 'school-reply-consumer' },
        },
      },
    ]),
  ],

  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
