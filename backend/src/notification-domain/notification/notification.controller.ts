import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
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
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('history')
  getHistory(
    @CurrentUser() user: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('q') q?: string,
  ) {
    return this.notificationService.getHistory(user.id, page, limit, category, priority, q);
  }

  @Get()
  getNotifications(@CurrentUser() user: any, @Query() query: any) {
    return this.getHistory(user, query.page, query.limit, query.category, query.priority, query.q);
  }

  // NoticePage aliases
  @Get('/announcements')
  getAnnouncements(@CurrentUser() user: any, @Query() query: any) {
    return this.getHistory(user, query.page, query.limit, query.category, query.priority, query.q);
  }

  @Post('/announcements')
  sendAnnouncement(@CurrentUser() user: any, @Body() dto: any, @Req() req: any) {
    return this.sendNotification(user, dto, req);
  }

  @Post('send')
  sendNotification(@CurrentUser() user: any, @Body() dto: any, @Req() req: any) {
    console.log(`[Controller] sendNotification called by user.id=${user?.id}, role=${user?.role}`);
    console.log(`[Controller] dto:`, JSON.stringify(dto));
    const token = req.headers.authorization?.split(' ')[1];
    return this.notificationService.sendNotification({ ...user, token }, dto);
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationService.markRead(id);
  }

  @Post('read-all')
  markAllRead(@CurrentUser() user: any) {
    return this.notificationService.markAllRead(user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }

  @Delete('clear-all')
  clearAll(@CurrentUser() user: any) {
    return this.notificationService.clearAll(user.id);
  }

  @Get('preferences')
  getPreferences(@CurrentUser() user: any) {
    return this.notificationService.getPreferences(user.id);
  }

  @Put('preferences')
  updatePreferences(@CurrentUser() user: any, @Body() prefs: any) {
    return this.notificationService.updatePreferences(user.id, prefs);
  }

  @Post('test')
  sendTest(@CurrentUser() user: any, @Body() body: { channel: string }) {
    // Just a mock for the test button
    return { ok: true, message: 'Test notification sent' };
  }

  @Get('debug/all')
  debugGetAllNotifications(@CurrentUser() user: any) {
    console.log(`[Debug] Getting all notifications for user.id=${user?.id}`);
    return this.notificationService.getAllForUser(user.id);
  }
}
