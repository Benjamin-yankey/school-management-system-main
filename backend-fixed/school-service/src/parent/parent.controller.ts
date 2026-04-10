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
@Roles('parent')
@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) { }

  /**
   * Link a student to this parent account.
   * POST /parent/children
   */
  @Post('children')
  linkStudent(@CurrentUser() user: any, @Body() dto: LinkStudentDto) {
    return this.parentService.linkStudent(user.id, dto);
  }

  /**
   * List all children linked to this parent with their enrollment info.
   * GET /parent/children
   */
  @Get('children')
  getMyChildren(@CurrentUser() user: any) {
    return this.parentService.getMyChildren(user.id);
  }

  /**
   * Get details for one linked child (with full enrollment history).
   * GET /parent/children/:studentId
   */
  @Get('children/:studentId')
  getChildDetail(@CurrentUser() user: any, @Param('studentId') studentId: string) {
    return this.parentService.getChildDetail(user.id, studentId);
  }

  /**
   * Unlink a student from this parent account.
   * DELETE /parent/children/:studentId
   */
  @Delete('children/:studentId')
  unlinkStudent(@CurrentUser() user: any, @Param('studentId') studentId: string) {
    return this.parentService.unlinkStudent(user.id, studentId);
  }

  /**
   * Administrative linking: link any student to any parent.
   * POST /administration/parents/:parentUserId/students/:studentId
   */
  @Roles('superadmin', 'administration')
  @Post('administration/parents/:parentUserId/students/:studentId')
  linkStudentByAdmin(
    @Param('parentUserId') parentUserId: string,
    @Param('studentId') studentId: string,
    @Body('relationship') relationship?: string,
  ) {
    return this.parentService.linkStudentByAdmin(parentUserId, studentId, relationship);
  }

  @Roles('superadmin', 'administration')
  @Post('administration/parents/:parentUserId/students/bulk-link')
  bulkLinkStudentsByAdmin(
    @Param('parentUserId') parentUserId: string,
    @Body() dto: { studentIds: string[], relationship?: string },
  ) {
    return this.parentService.bulkLinkStudentsByAdmin(parentUserId, dto.studentIds, dto.relationship);
  }

  @Roles('superadmin', 'administration')
  @Get('administration/associations')
  getAllAssociations() {
    return this.parentService.getAllAssociations();
  }

  @Roles('superadmin', 'administration')
  @Delete('administration/parents/:parentUserId/students/:studentId')
  unlinkStudentByAdmin(
    @Param('parentUserId') parentUserId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.parentService.unlinkStudentByAdmin(parentUserId, studentId);
  }
}
