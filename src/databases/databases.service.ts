import { Injectable, OnModuleInit } from '@nestjs/common';
/* eslint-disable prettier/prettier */
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Company } from 'src/companies/schema/company.schema';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class DatabasesService implements OnModuleInit {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}
  onModuleInit() {
    console.log(`The module has been initialized.`);
  }
}
