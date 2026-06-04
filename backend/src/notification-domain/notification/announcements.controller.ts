import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  getAnnouncements(@CurrentUser() user: any, @Query() query: any) {
    return this.notificationService.getHistory(
      user.id,
      query.page || 1,
      query.limit || 20,
      query.category,
      query.priority,
      query.q,
    );
  }

  @Post()
  sendAnnouncement(@CurrentUser() user: any, @Body() dto: any, @Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.notificationService.sendNotification({ ...user, token }, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }
}
