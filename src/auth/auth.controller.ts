/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { Request as ExpressRequest, response, Response } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Đăng nhập thành công')
  @Post('/login')
  async login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return await this.authService.login(req.user, response);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // Gey User By Token
  @Public()
  @ResponseMessage('Get User By Token')
  @Get('/refresh')
  async refreshToken(
    @Req() request: ExpressRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return await this.authService.processNewToken(refreshToken, response);
  }

  //Logout
  @ResponseMessage('Đăng xuất thành công')
  @Post('/logout')
  async logout(@Res({ passthrough: true }) response: Response, @User() user) {
    return await this.authService.logout(response, user);
  }
}
