import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateAdministrationDto } from './dto/create-administration.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateCredentialsDto } from './dto/update-credentials.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MustResetGuard } from '../common/guards/must-reset.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ScopeGuard } from '../common/guards/scope.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Post('superadmin/create-administration')
  createAdministration(@Body() dto: CreateAdministrationDto) {
    return this.userService.createAdministration(dto);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Get('superadmin/stats')
  getGlobalStats() {
    return this.userService.getGlobalStats();
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Get('superadmin/users')
  listAllUsers() {
    return this.userService.listAllUsers();
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Get('superadmin/schools/:schoolId/users')
  listUsersBySchool(@Param('schoolId') schoolId: string) {
    return this.userService.listUsersBySchool(schoolId);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Post('superadmin/schools/:schoolId/users')
  createUserForSchool(@Param('schoolId') schoolId: string, @Body() dto: CreateUserDto) {
    return this.userService.createUserForSchool(schoolId, dto);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Post('superadmin/reset-admin-password/:id')
  resetAdminPassword(@Param('id') id: string) {
    return this.userService.resetAdminPassword(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Get('superadmin/administrations')
  listAdministrations() {
    return this.userService.listAdministrations();
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Patch('superadmin/deactivate/:id')
  deactivateSuperadmin(@Param('id') id: string) {
    return this.userService.deactivateUser(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Patch('superadmin/update-credentials')
  updateCredentials(@CurrentUser() user: any, @Body() dto: UpdateCredentialsDto) {
    return this.userService.updateSuperadminCredentials(user.id, dto);
  }

  // ── Administration ─────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Post('administration/create-user')
  createUser(@CurrentUser() user: any, @Body() dto: CreateUserDto) {
    // Pass user.id — service resolves schoolId from DB (it's not in the JWT)
    return this.userService.createUser(dto, user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard, ScopeGuard)
  @Roles('superadmin', 'administration')
  @Post('administration/reset-password/:id')
  resetUserPassword(@Param('id') id: string, @CurrentUser() user: any) {
    return this.userService.resetUserPassword(id, user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin', 'administration')
  @Get('administration/users')
  listUsers(@CurrentUser() user: any) {
    return this.userService.listSchoolUsers(user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard, ScopeGuard)
  @Roles('superadmin', 'administration')
  @Patch('administration/deactivate/:id')
  deactivateUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.userService.deactivateSchoolUser(id, user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard)
  @Roles('superadmin')
  @Patch('superadmin/activate/:id')
  activateSuperadmin(@Param('id') id: string) {
    return this.userService.activateUser(id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard, RolesGuard, ScopeGuard)
  @Roles('superadmin', 'administration')
  @Patch('administration/activate/:id')
  activateUser(@Param('id') id: string, @CurrentUser() user: any) {
    return this.userService.activateSchoolUser(id, user.id);
  }

  // ── Profile ────────────────────────────────────────────────────────────────

  @UseGuards(JwtAuthGuard, MustResetGuard)
  @Get('profile/me')
  getProfile(@CurrentUser() user: any) {
    return this.userService.getProfile(user.id);
  }

  @UseGuards(JwtAuthGuard, MustResetGuard)
  @Patch('profile/me')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.id, dto);
  }
}
