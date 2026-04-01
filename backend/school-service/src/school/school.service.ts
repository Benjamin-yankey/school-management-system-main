import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

  create(dto: CreateSchoolDto) {
    return this.schoolRepo.save(this.schoolRepo.create(dto));
  }

  findAll() {
    return this.schoolRepo.find();
  }

  async findOne(id: string) {
    const school = await this.schoolRepo.findOneBy({ id });
    if (!school) throw new NotFoundException();
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto) {
    await this.findOne(id);
    await this.schoolRepo.update(id, dto);
    return this.findOne(id);
  }

  async validate(schoolId: string): Promise<{ exists: boolean }> {
    const school = await this.schoolRepo.findOneBy({ id: schoolId, isActive: true });
    return { exists: !!school };
  }
}
