import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Controller('subjects')
export class SubjectController {
    constructor(private readonly subjectService: SubjectService) { }

    @Roles('superadmin', 'administration')
    @Post()
    create(@Body() dto: CreateSubjectDto) {
        return this.subjectService.create(dto);
    }

    @Roles('superadmin', 'administration', 'teacher', 'student', 'parent')
    @Get()
    findAll(@Query('classLevelId') classLevelId?: string) {
        if (classLevelId) return this.subjectService.findByClassLevel(classLevelId);
        return this.subjectService.findAll();
    }

    @Roles('superadmin', 'administration')
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.subjectService.delete(id);
    }
}