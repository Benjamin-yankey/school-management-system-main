import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentStudent } from './parent-student.entity';
import { ParentService } from './parent.service';
import { ParentController, ParentAdminController } from './parent.controller';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParentStudent]), StudentModule],
  controllers: [ParentController, ParentAdminController],
  providers: [ParentService],
})
export class ParentModule {}
