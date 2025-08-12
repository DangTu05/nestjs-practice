/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company } from './schema/company.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { ObjectId } from 'bson';
import { isEmpty } from 'class-validator';
// const aqp = (await import('api-query-params')).default;

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<Company>,
  ) {}
  create(createCompanyDto: CreateCompanyDto, user: IUser) {
    return this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: new ObjectId(user._id),
        email: user.email,
      },
    });
  }

  findAll = async (
    currentPage: number,
    limit: number,
    qs: Record<string, any>,
  ) => {
    const { sort = 'createdAt', ...filter } = qs;

    delete filter.page;
    delete filter.limit;
    console.log(filter);
    
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const [result, totalItems] = await Promise.all([
      await this.companyModel
        .find(filter) // tìm kiếm giống toán tử like /keyword/i
        .skip(offset)
        .limit(defaultLimit)
        .sort(sort)
        .exec(),
      await this.companyModel.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    return {
      meta: {
        currentPage,
        defaultLimit,
        totalPages,
        totalItems,
      },
      result,
    };
  };

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return this.companyModel.findByIdAndUpdate(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedby: {
          _id: user._id,
          email: user.email,
        },
      },
      { new: true },
    );
  }

  remove(id: string, user: IUser) {
    return this.companyModel.updateOne(
      { _id: id },
      {
        isDeleted: true,
        deletedBy: {
          _id: new ObjectId(user._id),
          email: user.email,
        },
      },
    );
  }
}
