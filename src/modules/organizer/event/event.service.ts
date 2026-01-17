import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DbService } from 'src/lib/db/db.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import { Pagination } from 'src/lib/pagination/paginate';
import { isPrismaUniqueConstraintViolation } from 'src/lib/utils/prismaError';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  logger = new Logger(EventService.name);
  constructor(
    private readonly db: DbService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string) {
    try {
      const { schedules, faqs, isFeatured, ...rest } = createEventDto;
      if (isFeatured) {
        await this.db.event.updateMany({
          where: { organizerId, isFeatured: true },
          data: { isFeatured: false },
        });
      }
      const event = await this.db.event.create({
        data: {
          ...rest,
          organizerId,
          status: 'PUBLISHED',
          schedules: {
            create: schedules,
          },
          isFeatured,
          faqs: {
            create: faqs,
          },
        },
      });

      this.eventEmitter.emitAsync('event.created', event.id);

      return event;
    } catch (error) {
      if (isPrismaUniqueConstraintViolation(error)) {
        throw new BadRequestException('Event handle already exists', {
          handle: 'The handle field must be unique.',
        });
      }

      this.logger.error(error);
      throw new InternalServerErrorException('Failed to create event');
    }
  }

  async markAsCompleted(eventId: string) {
    return this.db.event.update({
      where: { id: eventId },
      data: { completedAt: new Date() },
    });
  }

  async getAll(params: Pagination, organizerId: string) {
    return this.db.$transaction([
      this.db.event.findMany({
        ...params,
        where: {
          ...params.where,
          organizerId,
        },
        include: {
          schedules: true,
          faqs: true,
        },
      }),
      this.db.event.count({
        where: {
          ...params.where,
          organizerId,
        },
      }),
    ]);
  }

  async getJoinees(eventId: string, params: Pagination) {
    return this.db.$transaction([
      this.db.userEvent.findMany({
        ...params,
        where: {
          ...params.where,
          eventId,
        },
        include: {
          user: true,
          payment: true,
          ban: true,
        },
      }),
      this.db.userEvent.count({
        where: {
          eventId,
          ...params.where,
        },
      }),
    ]);
  }

  async getCertificates(eventId: string, params: Pagination) {
    return this.db.$transaction([
      this.db.certificate.findMany({
        ...params,
        where: {
          ...params.where,
          eventId,
        },
        include: {
          user: true,
        },
      }),
      this.db.certificate.count({
        where: {
          eventId,
          ...params.where,
        },
      }),
    ]);
  }

  async findOne(id: string) {
    try {
      const event = await this.db.event.findUnique({
        where: { id },
        include: {
          schedules: true,
          faqs: true,
          settings: true,
          organizer: true,
        },
      });

      if (!event) {
        throw new BadRequestException('Event not found', {
          id: 'The event not found',
        });
      }

      const [totalParticipants, totalCertificates, totalRevenue] =
        await this.db.$transaction([
          this.db.userEvent.count({
            where: {
              eventId: event.id,
            },
          }),
          this.db.certificate.count({
            where: {
              eventId: event.id,
            },
          }),
          this.db.payment.aggregate({
            where: {
              eventId: event.id,
              paymentStatus: 'PAID',
            },
            _sum: {
              amount: true,
            },
          }),
        ]);

      const now = new Date();
      const isOngoing = event.startDate <= now && event.endDate >= now;
      const hasStarted = event.startDate <= now;
      const hasEnded = event.endDate < now;

      return {
        ...event,
        analytics: {
          totalParticipants,
          totalCertificates,
          certificateRate:
            totalParticipants > 0
              ? (totalCertificates / totalParticipants) * 100
              : 0,
          totalRevenue: totalRevenue._sum.amount || 0,
          status: {
            isOngoing,
            hasStarted,
            hasEnded,
          },
        },
      };
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    organizerId: string,
  ) {
    try {
      const { schedules, faqs, isFeatured, ...rest } = updateEventDto;
      if (isFeatured) {
        await this.db.event.updateMany({
          where: { organizerId, isFeatured: true },
          data: { isFeatured: false },
        });
      }
      return await this.db.event.update({
        where: { id },
        data: {
          ...rest,
          status: 'PUBLISHED',
          isFeatured,
          schedules: {
            deleteMany: {},
            create: schedules,
          },
          faqs: {
            deleteMany: {},
            create: faqs,
          },
        },
      });
    } catch (error) {
      if (isPrismaUniqueConstraintViolation(error)) {
        throw new BadRequestException('Event handle already exists', {
          handle: 'The handle field must be unique.',
        });
      }

      this.logger.error(error);
      throw new InternalServerErrorException('Failed to update event');
    }
  }

  async remove(id: string) {
    try {
      return await this.db.event.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to delete event');
    }
  }
}
