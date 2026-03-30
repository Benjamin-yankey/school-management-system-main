import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  @HttpCode(200)
  async signOut(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.authService.signOut(token);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('first-login-reset')
  @HttpCode(200)
  async firstLoginReset(@CurrentUser() user: any, @Req() req: Request, @Body() dto: ChangePasswordDto) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.authService.firstLoginReset(user.id, token, dto);
    return { message: 'Password reset successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  async changePassword(@CurrentUser() user: any, @Req() req: Request, @Body() dto: ChangePasswordDto) {
    const token = req.headers.authorization?.split(' ')[1];
    await this.authService.changePassword(user.id, token, dto);
    return { message: 'Password changed successfully' };
  }
}
