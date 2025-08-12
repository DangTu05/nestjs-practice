/* eslint-disable prettier/prettier */
import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
//@Public()
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

//@User()
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
