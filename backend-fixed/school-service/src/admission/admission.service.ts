import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdmissionYear } from './admission-year.entity';
import { Application, ApplicationStatus } from './application.entity';
import { CreateAdmissionYearDto } from './dto/create-admission-year.dto';
import { ApplyDto } from './dto/apply.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class AdmissionService {
  constructor(
    @InjectRepository(AdmissionYear)
    private readonly yearRepo: Repository<AdmissionYear>,
    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,
  ) {}

  // ── Admission Years ──────────────────────────────────────────────

  async createYear(dto: CreateAdmissionYearDto): Promise<AdmissionYear> {
    const existing = await this.yearRepo.findOneBy({ year: dto.year });
    if (existing) throw new BadRequestException(`Admission year ${dto.year} already exists`);
    return this.yearRepo.save(this.yearRepo.create({ year: dto.year }));
  }

  findAllYears(): Promise<AdmissionYear[]> {
    return this.yearRepo.find({ order: { createdAt: 'DESC' } });
  }

  async openYear(id: string): Promise<AdmissionYear> {
    // close any currently open year
    await this.yearRepo.update({ isOpen: true }, { isOpen: false });
    await this.yearRepo.update(id, { isOpen: true });
    return this.getYearOrFail(id);
  }

  async closeYear(id: string): Promise<AdmissionYear> {
    await this.yearRepo.update(id, { isOpen: false });
    return this.getYearOrFail(id);
  }

  getCurrentYear(): Promise<AdmissionYear | null> {
    return this.yearRepo.findOneBy({ isOpen: true });
  }

  private async getYearOrFail(id: string): Promise<AdmissionYear> {
    const year = await this.yearRepo.findOneBy({ id });
    if (!year) throw new NotFoundException('Admission year not found');
    return year;
  }

  // ── Applications ─────────────────────────────────────────────────

  async apply(dto: ApplyDto): Promise<Application> {
    const openYear = await this.yearRepo.findOneBy({ isOpen: true });
    if (!openYear) throw new BadRequestException('No admission is currently open');

    // prevent duplicate email per year
    const duplicate = await this.appRepo.findOne({
      where: { email: dto.email, admissionYearId: openYear.id },
    });
    if (duplicate) throw new BadRequestException('You have already applied for this admission year');

    const application = this.appRepo.create({ ...dto, admissionYearId: openYear.id });
    return this.appRepo.save(application);
  }

  getApplicationsByYear(yearId: string): Promise<Application[]> {
    return this.appRepo.find({
      where: { admissionYearId: yearId },
      order: { submittedAt: 'DESC' },
    });
  }

  async updateApplicationStatus(id: string, dto: UpdateApplicationStatusDto): Promise<Application> {
    const application = await this.appRepo.findOneBy({ id });
    if (!application) throw new NotFoundException('Application not found');
    await this.appRepo.update(id, { status: dto.status });
    return this.appRepo.findOneBy({ id });
  }

  async getApplicationById(id: string): Promise<Application> {
    const application = await this.appRepo.findOneBy({ id });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }
}
