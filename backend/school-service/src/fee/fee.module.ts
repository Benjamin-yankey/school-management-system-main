import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fee } from './fee.entity';
import { FeeService } from './fee.service';
import { FeeController } from './fee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Fee])],
  providers: [FeeService],
  controllers: [FeeController],
  exports: [FeeService],
})
export class FeeModule {}
