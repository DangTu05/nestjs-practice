/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({
    message: 'Tên công ty không được để trống',
  })
  name: string;

  @IsNotEmpty({
    message: 'Địa chỉ công ty không được để trống',
  })
  address: string;

  description: string;
}
