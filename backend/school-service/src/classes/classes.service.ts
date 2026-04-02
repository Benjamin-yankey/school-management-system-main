import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassLevel } from './class-level.entity';
import { Section } from './section.entity';
import { AcademicYear } from './academic-year.entity';
import { AcademicTerm } from './academic-term.entity';
import { CreateClassLevelDto } from './dto/create-class-level.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { CreateAcademicTermDto } from './dto/create-academic-term.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassLevel)
    private readonly classLevelRepo: Repository<ClassLevel>,
    @InjectRepository(Section)
    private readonly sectionRepo: Repository<Section>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepo: Repository<AcademicYear>,
    @InjectRepository(AcademicTerm)
    private readonly termRepo: Repository<AcademicTerm>,
  ) {}

  // ── Academic Years ───────────────────────────────────────────────

  async createAcademicYear(dto: CreateAcademicYearDto): Promise<AcademicYear> {
    // 8. Academic year format validation YYYY/YYYY
    const regex = /^(\d{4})\/(\d{4})$/;
    const match = dto.year.match(regex);
    if (!match) throw new BadRequestException('Academic year must be in YYYY/YYYY format');
    
    const year1 = parseInt(match[1]);
    const year2 = parseInt(match[2]);
    if (year2 !== year1 + 1) {
      throw new BadRequestException('The second year must be exactly one year after the first');
    }

    const existing = await this.academicYearRepo.findOneBy({ year: dto.year });
    if (existing) throw new BadRequestException(`Academic year ${dto.year} already exists`);
    return this.academicYearRepo.save(this.academicYearRepo.create(dto));
  }

  findAllAcademicYears(): Promise<AcademicYear[]> {
    return this.academicYearRepo.find({ order: { createdAt: 'DESC' } });
  }

  async setActiveAcademicYear(id: string): Promise<AcademicYear> {
    await this.academicYearRepo.update({ isActive: true }, { isActive: false });
    await this.academicYearRepo.update(id, { isActive: true });
    return this.getAcademicYearOrFail(id);
  }

  getActiveAcademicYear(): Promise<AcademicYear | null> {
    return this.academicYearRepo.findOneBy({ isActive: true });
  }

  async getAcademicYearOrFail(id: string): Promise<AcademicYear> {
    const year = await this.academicYearRepo.findOneBy({ id });
    if (!year) throw new NotFoundException('Academic year not found');
    return year;
  }

  // ── Academic Terms ────────────────────────────────────────────────

  async createAcademicTerm(dto: CreateAcademicTermDto): Promise<AcademicTerm> {
    await this.getAcademicYearOrFail(dto.academicYearId);
    
    if (dto.isCurrent) {
      await this.termRepo.update({ academicYearId: dto.academicYearId, isCurrent: true }, { isCurrent: false });
    }
    
    return this.termRepo.save(this.termRepo.create(dto));
  }

  findAllAcademicTerms(academicYearId?: string): Promise<AcademicTerm[]> {
    const where = academicYearId ? { academicYearId } : {};
    return this.termRepo.find({ where, order: { startDate: 'ASC' } });
  }

  async setActiveAcademicTerm(id: string): Promise<AcademicTerm> {
    const term = await this.getAcademicTermOrFail(id);
    await this.termRepo.update({ academicYearId: term.academicYearId, isCurrent: true }, { isCurrent: false });
    await this.termRepo.update(id, { isCurrent: true });
    return this.getAcademicTermOrFail(id);
  }

  async getActiveAcademicTerm(): Promise<AcademicTerm | null> {
    const activeYear = await this.getActiveAcademicYear();
    if (!activeYear) return null;
    return this.termRepo.findOneBy({ academicYearId: activeYear.id, isCurrent: true });
  }

  async getAcademicTermOrFail(id: string): Promise<AcademicTerm> {
    const term = await this.termRepo.findOneBy({ id });
    if (!term) throw new NotFoundException('Academic term not found');
    return term;
  }

  // ── Class Levels ─────────────────────────────────────────────────

  async createClassLevel(dto: CreateClassLevelDto): Promise<ClassLevel> {
    const existing = await this.classLevelRepo.findOneBy({ name: dto.name });
    if (existing) throw new BadRequestException(`Class level "${dto.name}" already exists`);
    return this.classLevelRepo.save(this.classLevelRepo.create(dto));
  }

  findAllClassLevels(): Promise<ClassLevel[]> {
    return this.classLevelRepo.find({ order: { order: 'ASC' } });
  }

  async findClassLevelById(id: string): Promise<ClassLevel> {
    const cl = await this.classLevelRepo.findOneBy({ id });
    if (!cl) throw new NotFoundException('Class level not found');
    return cl;
  }

  async updateClassLevel(id: string, dto: Partial<CreateClassLevelDto>): Promise<ClassLevel> {
    await this.findClassLevelById(id);
    await this.classLevelRepo.update(id, dto);
    return this.findClassLevelById(id);
  }

  async getNextClassLevel(currentOrder: number): Promise<ClassLevel | null> {
    return this.classLevelRepo.findOne({ where: { order: currentOrder + 1 } });
  }

  // ── Sections ─────────────────────────────────────────────────────

  async createSection(classLevelId: string, dto: CreateSectionDto): Promise<Section> {
    await this.findClassLevelById(classLevelId);
    await this.getAcademicYearOrFail(dto.academicYearId);
    return this.sectionRepo.save(this.sectionRepo.create({ ...dto, classLevelId }));
  }

  getSectionsByClass(classLevelId: string): Promise<Section[]> {
    return this.sectionRepo.find({ where: { classLevelId } });
  }

  async findSectionById(id: string): Promise<Section | null> {
    return this.sectionRepo.findOneBy({ id });
  }

  async updateSection(id: string, dto: Partial<CreateSectionDto>): Promise<Section> {
    const section = await this.sectionRepo.findOneBy({ id });
    if (!section) throw new NotFoundException('Section not found');
    await this.sectionRepo.update(id, dto);
    return this.sectionRepo.findOneBy({ id });
  }

  async deleteSection(id: string): Promise<{ message: string }> {
    const section = await this.sectionRepo.findOneBy({ id });
    if (!section) throw new NotFoundException('Section not found');
    await this.sectionRepo.delete(id);
    return { message: 'Section deleted' };
  }

  async seedClassLevels(): Promise<{ message: string }> {
    const classLevels = [
      { name: 'Primary 1', level: 'primary', order: 1 },
      { name: 'Primary 2', level: 'primary', order: 2 },
      { name: 'Primary 3', level: 'primary', order: 3 },
      { name: 'Primary 4', level: 'primary', order: 4 },
      { name: 'Primary 5', level: 'primary', order: 5 },
      { name: 'Primary 6', level: 'primary', order: 6 },
      { name: 'JHS 1', level: 'jhs', order: 7 },
      { name: 'JHS 2', level: 'jhs', order: 8 },
      { name: 'JHS 3', level: 'jhs', order: 9 },
      { name: 'SHS 1', level: 'shs', order: 10 },
      { name: 'SHS 2', level: 'shs', order: 11 },
      { name: 'SHS 3', level: 'shs', order: 12 },
    ];

    for (const cl of classLevels) {
      const exists = await this.classLevelRepo.findOneBy({ name: cl.name });
      if (!exists) {
        await this.classLevelRepo.save(this.classLevelRepo.create(cl as any));
      }
    }

    return { message: 'Class levels seeded successfully' };
  }
}
