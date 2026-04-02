import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionYear } from './admission-year.entity';
import { Application } from './application.entity';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { AcademicYear } from '../classes/academic-year.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdmissionYear, Application, AcademicYear])],
  controllers: [AdmissionController],
  providers: [AdmissionService],
  exports: [AdmissionService],
})
export class AdmissionModule {}
