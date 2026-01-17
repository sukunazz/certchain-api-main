import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeamMember } from '@prisma/client';
import { CurrentUser } from 'src/modules/users/auth/decorators/current-user';
import { OrganizerJwtAuthGuard } from '../auth/guards/jwt.guard';
import { BanUserFromEventDto } from './dto/ban-user-from-event.dto';
import { UserEventService } from './user-event.service';

@Controller('organizer/user-event')
@UseGuards(OrganizerJwtAuthGuard)
@ApiTags('Organizer User Event')
export class UserEventController {
  constructor(private readonly userEventService: UserEventService) {}

  @Post(':id/ban')
  @ApiOperation({ summary: 'Ban a user from an event' })
  async ban(
    @Param('id') id: string,
    @Body() data: BanUserFromEventDto,
    @CurrentUser() user: TeamMember,
  ) {
    const ban = await this.userEventService.ban(id, data, user);
    return {
      message: 'User banned from event',
      data: ban,
    };
  }

  @Post(':id/unban')
  @ApiOperation({ summary: 'Unban a user from an event' })
  async unban(@Param('id') id: string) {
    const unban = await this.userEventService.unban(id);
    return {
      message: 'User unbanned from event',
      data: unban,
    };
  }
}
