import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}
  hashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };
  isValidPassword = (password: string, hash: string) => {
    return compareSync(password, hash);
  };
  create(userDto: CreateUserDto) {
    const hashPassword = this.hashPassword(userDto.password);
    return this.userModel.create({
      ...userDto,
      password: hashPassword,
    });
  }

  findAll() {
    return `This action returns all users`;
  }

  findOneByEmail(email: string) {
    return this.userModel.findOne({ email: email }).lean();
  }

  update = async (updateUserDto: UpdateUserDto) => {
    const user = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
    return user;
  };

  remove = async (id: string) => {
    return await this.userModel.deleteOne({ _id: id });
  };
  saveRefreshToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id: _id },
      { refresh_token: refreshToken },
    );
  };
  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refresh_token: refreshToken });
  };
}
