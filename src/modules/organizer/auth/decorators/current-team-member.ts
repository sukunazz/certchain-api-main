import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TeamMember } from '@prisma/client';

export const CurrentTeamMember = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Omit<TeamMember, 'password'> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
