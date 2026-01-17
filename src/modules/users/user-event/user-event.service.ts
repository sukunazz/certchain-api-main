import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { Pagination } from 'src/lib/pagination/paginate';
import { UpdateUserEventDto } from './dto/update-user-event.dto';

@Injectable()
export class UserEventService {
  constructor(private readonly db: DbService) {}

  async getAll(params: Pagination, userId: string) {
    return this.db.$transaction([
      this.db.userEvent.findMany({
        ...params,
        where: {
          ...params.where,
          userId,
        },
        include: {
          event: true,
        },
      }),
      this.db.userEvent.count({
        where: {
          ...params.where,
          userId,
        },
      }),
    ]);
  }

  async getOne(id: string) {
    const event = await this.db.userEvent.findUnique({
      where: {
        id,
      },
      include: {
        event: {
          include: {
            faqs: true,
            schedules: true,
            organizer: true,
          },
        },
        certificate: true,
        payment: true,
        user: true,
        ban: true,
      },
    });

    if (event?.ban) {
      delete event.event.link;
      delete event.event.password;
      delete event.event.address;
      delete event.event.city;
      delete event.event.state;
      delete event.event.country;
      delete event.event.pincode;
    }

    return event;
  }

  isJoined(id: string, userId: string) {
    return this.db.userEvent.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  update(id: number, updateUserEventDto: UpdateUserEventDto) {
    return `This action updates a #${id} userEvent`;
  }

  remove(id: number) {
    return `This action removes a #${id} userEvent`;
  }
}
