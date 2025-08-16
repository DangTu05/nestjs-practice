/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const isValidPassword = this.usersService.isValidPassword(
        pass,
        user.password,
      );
      if (isValidPassword) return user;
    }
    return null;
  }
  async login(user: IUser, response: Response) {
    const { _id, name, email, role } = user;
    const payload = {
      sub: 'login token',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    const refresh_token = this.createRefreshToken(payload);
    await this.usersService.saveRefreshToken(refresh_token, _id);
    const expireStr =
      this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE') || '1d';
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: ms(expireStr as ms.StringValue), // ms() sẽ trả ra số milliseconds,
    });
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
      _id,
      name,
      email,
      role,
    };
  }
  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE'),
    });
    return refresh_token;
  };
  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });
      const user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'login token',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };
        const refresh_token = this.createRefreshToken(payload);

        // Lưu refreshToken
        await this.usersService.saveRefreshToken(refresh_token, _id.toString());
        const expireStr =
          this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRE') || '1d';

        // xóa cookie nếu đã tồn tại trước đó
        response.clearCookie('refresh_token');

        // Xét cookie cho refresh_token
        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: ms(expireStr as ms.StringValue), // ms() sẽ trả ra số milliseconds,
        });
        return {
          access_token: this.jwtService.sign(payload),
          refresh_token,
          _id,
          name,
          email,
          role,
        };
      } else {
        throw new NotFoundException('Không tìm thấy user');
      }
    } catch (error) {
      throw new BadRequestException('Token không hợp lệ');
    }
  };
  logout = async (response: Response, user: IUser) => {
    await this.usersService.saveRefreshToken('', user._id);
    response.clearCookie('refresh_token');
    return 'ok';
  };
}
