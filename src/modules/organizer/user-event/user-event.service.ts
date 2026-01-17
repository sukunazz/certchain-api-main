import { Injectable } from '@nestjs/common';
import { TeamMember } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { BanUserFromEventDto } from './dto/ban-user-from-event.dto';

@Injectable()
export class UserEventService {
  constructor(private readonly db: DbService) {}

  ban(id: string, data: BanUserFromEventDto, currentUser: TeamMember) {
    return this.db.userEvent.update({
      where: { id },
      data: {
        ban: {
          create: {
            reason: data.reason,
            bannedById: currentUser.id,
          },
        },
      },
    });
  }

  unban(userEventId: string) {
    return this.db.participantBan.delete({
      where: { userEventId },
    });
  }
}
