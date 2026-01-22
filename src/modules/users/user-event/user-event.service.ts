import { Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';
import { Pagination } from 'src/lib/pagination/paginate';
import { UpdateUserEventDto } from './dto/update-user-event.dto';

@Injectable()
export class UserEventService {
  constructor(private readonly db: DbService) {}

  async getAll(params: Pagination, userId: string) {
    const [data, count] = await this.db.$transaction([
      this.db.userEvent.findMany({
        ...params,
        where: {
          ...params.where,
          userId,
        },
        include: {
          event: true,
          certificate: true,
        },
      }),
      this.db.userEvent.count({
        where: {
          ...params.where,
          userId,
        },
      }),
    ]);

    const normalized = data.map((userEvent) => {
      const certificate = userEvent.certificate as
        | { id?: string }
        | string
        | null
        | undefined;
      const certificateId =
        typeof certificate === 'string' ? certificate : certificate?.id;
      return {
        ...userEvent,
        certificate:
          certificate &&
          typeof certificate !== 'string' &&
          certificate.id &&
          certificate.id !== 'undefined'
            ? certificate
            : null,
        certificateId:
          certificateId && certificateId !== 'undefined' ? certificateId : null,
      };
    });

    return [normalized, count];
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

    const certificate = event?.certificate as
      | { id?: string }
      | string
      | null
      | undefined;
    const certificateId =
      typeof certificate === 'string' ? certificate : certificate?.id;
    const normalizedEvent = event
      ? {
          ...event,
          certificate:
            certificate &&
            typeof certificate !== 'string' &&
            certificate.id &&
            certificate.id !== 'undefined'
              ? certificate
              : null,
          certificateId:
            certificateId && certificateId !== 'undefined'
              ? certificateId
              : null,
        }
      : event;

    if (normalizedEvent?.ban) {
      delete normalizedEvent.event.link;
      delete normalizedEvent.event.password;
      delete normalizedEvent.event.address;
      delete normalizedEvent.event.city;
      delete normalizedEvent.event.state;
      delete normalizedEvent.event.country;
      delete normalizedEvent.event.pincode;
    }

    return normalizedEvent;
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
