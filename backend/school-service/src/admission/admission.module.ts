import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdmissionYear } from './admission-year.entity';
import { Application } from './application.entity';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdmissionYear, Application])],
  controllers: [AdmissionController],
  providers: [AdmissionService],
  exports: [AdmissionService],
})
export class AdmissionModule {}
