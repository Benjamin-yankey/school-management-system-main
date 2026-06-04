import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassLevel } from './class-level.entity';
import { Section } from './section.entity';
import { AcademicYear } from './academic-year.entity';
import { AcademicTerm } from './academic-term.entity';
import { ClassesService } from './classes.service';
import {
  AcademicTermsController,
  AcademicYearsController,
  ClassLevelsController,
  SectionsController,
} from './classes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassLevel, Section, AcademicYear, AcademicTerm])],
  controllers: [
    AcademicYearsController,
    AcademicTermsController,
    ClassLevelsController,
    SectionsController,
  ],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
