import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Grade } from './grade.entity';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { SubjectModule } from '../subject/subject.module';  // ← import the module

@Module({
  imports: [
    TypeOrmModule.forFeature([Grade]),  // ← remove Subject from here
    SubjectModule,                       // ← add this
  ],
  providers: [GradeService],
  controllers: [GradeController],
  exports: [GradeService],
})
export class GradeModule { }