import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ParentService } from './parent.service';
import { LinkStudentDto } from './dto/link-student.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Controller()
export class ParentController {
  constructor(private readonly parentService: ParentService) { }

  /**
   * Link a student to this parent account.
   * POST /parent/children
   */
  @Roles('parent')
  @Post('parent/children')
  linkStudent(@CurrentUser() user: any, @Body() dto: LinkStudentDto) {
    return this.parentService.linkStudent(user.id, dto);
  }

  /**
   * List all children linked to this parent with their enrollment info.
   * GET /parent/children
   */
  @Roles('parent')
  @Get('parent/children')
  getMyChildren(@CurrentUser() user: any) {
    return this.parentService.getMyChildren(user.id);
  }

  /**
   * Get details for one linked child (with full enrollment history).
   * GET /parent/children/:studentId
   */
  @Roles('parent')
  @Get('parent/children/:studentId')
  getChildDetail(@CurrentUser() user: any, @Param('studentId') studentId: string) {
    return this.parentService.getChildDetail(user.id, studentId);
  }

  /**
   * Unlink a student from this parent account.
   * DELETE /parent/children/:studentId
   */
  @Roles('parent')
  @Delete('parent/children/:studentId')
  unlinkStudent(@CurrentUser() user: any, @Param('studentId') studentId: string) {
    return this.parentService.unlinkStudent(user.id, studentId);
  }
}

@UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
@Roles('superadmin', 'administration')
@Controller('administration')
export class ParentAdminController {
  constructor(private readonly parentService: ParentService) { }

  /**
   * Administrative linking: link any student to any parent.
   * POST /administration/parents/:parentUserId/students/:studentId
   */
  @Post('parents/:parentUserId/students/:studentId')
  linkStudentByAdmin(
    @Param('parentUserId') parentUserId: string,
    @Param('studentId') studentId: string,
    @Body('relationship') relationship?: string,
  ) {
    return this.parentService.linkStudentByAdmin(parentUserId, studentId, relationship);
  }

  @Post('parents/:parentUserId/students/bulk-link')
  bulkLinkStudentsByAdmin(
    @Param('parentUserId') parentUserId: string,
    @Body() dto: { studentIds: string[], relationship?: string },
  ) {
    return this.parentService.bulkLinkStudentsByAdmin(parentUserId, dto.studentIds, dto.relationship);
  }

  @Get('associations')
  getAllAssociations() {
    return this.parentService.getAllAssociations();
  }

  @Delete('parents/:parentUserId/students/:studentId')
  unlinkStudentByAdmin(
    @Param('parentUserId') parentUserId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.unlinkStudentByAdmin(parentUserId, studentId);
  }
}
