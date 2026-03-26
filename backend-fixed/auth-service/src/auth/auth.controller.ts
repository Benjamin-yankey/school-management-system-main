import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
  signOut(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.signOut(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('first-login-reset')
  firstLoginReset(@CurrentUser() user: any, @Req() req: Request, @Body() dto: ChangePasswordDto) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.firstLoginReset(user.id, token, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@CurrentUser() user: any, @Req() req: Request, @Body() dto: ChangePasswordDto) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.changePassword(user.id, token, dto);
  }
}
