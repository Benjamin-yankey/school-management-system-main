import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnnouncementService } from './announcement.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@UseGuards(JwtAuthGuard, MustResetGuard)
@Controller('comms/announcements')
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  // POST /comms/announcements — create a new announcement
  @Post()
  create(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser() user: { id: string; role: string; schoolId: string },
  ) {
    return this.announcementService.create(dto, user);
  }

  // GET /comms/announcements — get announcements relevant to the caller's role
  @Get()
  findAll(@CurrentUser() user: { role: string; schoolId: string }) {
    return this.announcementService.findForUser(user);
  }

  // GET /comms/announcements/:id
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { schoolId: string },
  ) {
    return this.announcementService.findOne(id, user.schoolId);
  }

  // DELETE /comms/announcements/:id
  @Delete(':id')
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: string; schoolId: string },
  ) {
    return this.announcementService.delete(id, user);
  }
}
