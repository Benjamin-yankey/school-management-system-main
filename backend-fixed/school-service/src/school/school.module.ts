import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { School } from './school.entity';
import { SchoolService } from './school.service';
import { SchoolController } from './school.controller';
import { SchoolInternalController } from './school.internal.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([School])],
  controllers: [SchoolController, SchoolInternalController],
  providers: [SchoolService, JwtStrategy],
})
export class SchoolModule {}
