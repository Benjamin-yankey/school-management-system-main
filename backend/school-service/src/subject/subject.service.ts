import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectService {
    constructor(
        @InjectRepository(Subject)
        private readonly subjectRepo: Repository<Subject>,
    ) { }

    async create(dto: CreateSubjectDto): Promise<Subject> {
        const existing = await this.subjectRepo.findOneBy({
            name: dto.name,
            classLevelId: dto.classLevelId,
        });
        if (existing) {
            throw new BadRequestException(
                `Subject "${dto.name}" already exists for this class level`,
            );
        }
        return this.subjectRepo.save(this.subjectRepo.create(dto));
    }

    findByClassLevel(classLevelId: string): Promise<Subject[]> {
        return this.subjectRepo.find({
            where: { classLevelId },
            order: { name: 'ASC' },
        });
    }

    async findAll(): Promise<Subject[]> {
        return this.subjectRepo.find({ order: { name: 'ASC' } });
    }

    async delete(id: string): Promise<{ message: string }> {
        const subject = await this.subjectRepo.findOneBy({ id });
        if (!subject) throw new NotFoundException('Subject not found');
        await this.subjectRepo.delete(id);
        return { message: 'Subject deleted' };
    }
}