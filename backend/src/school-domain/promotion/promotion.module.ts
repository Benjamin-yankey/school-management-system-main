import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEnrollment } from '../student/student-enrollment.entity';
import { Student } from '../student/student.entity';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentEnrollment, Student]),
    ClassesModule,
  ],
  controllers: [PromotionController],
  providers: [PromotionService],
})
export class PromotionModule {}
