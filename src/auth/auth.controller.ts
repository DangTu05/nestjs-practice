/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from 'src/decorator/customize';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';


@Controller("/auth")
export class AuthController {
  constructor(
    private readonly authSercie: AuthService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return this.authSercie.login(req.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
