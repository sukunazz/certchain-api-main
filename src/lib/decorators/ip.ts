import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const IP = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const ip =
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.headers['x-client-ip'] ||
      request.ip;
    return Array.isArray(ip) ? ip[0] : ip;
  },
);
