import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import type { AuthenticatedUser } from '../../../common/types/authenticated-user.types.js';
import { LoginDto } from '../requests/login.schema.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  @UseGuards(JwtAuthGuard)
  getSession(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getSession(user);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
