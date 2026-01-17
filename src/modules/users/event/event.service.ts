import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ParticipantStatus, PaymentStatus } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import {
  KhaltiPaymentStatus,
  KhaltiService,
} from 'src/lib/khalti/khalti.service';
import { Pagination } from 'src/lib/pagination/paginate';
import { JoinEventDto } from './dto/join-event.dto';

@Injectable()
export class EventService {
  logger = new Logger(EventService.name);
  constructor(
    private readonly db: DbService,
    private readonly ks: KhaltiService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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
          organizer: true,
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

  async upcomingEvents(params: Pagination) {
    return this.db.$transaction([
      this.db.event.findMany({
        ...params,
        where: {
          ...params.where,
          startDate: {
            gte: new Date(),
          },
        },
      }),
      this.db.event.count({
        where: {
          ...params.where,
          startDate: {
            gte: new Date(),
          },
        },
      }),
    ]);
  }

  async getCurrentlyRunningEvents(params: Pagination) {
    return this.db.$transaction([
      this.db.event.findMany({
        ...params,
        where: {
          ...params.where,
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
        },
      }),
      this.db.event.count({
        where: {
          ...params.where,
          startDate: {
            lte: new Date(),
          },
          endDate: {
            gte: new Date(),
          },
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

      return event;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Failed to fetch event');
    }
  }

  async joinEvent(data: JoinEventDto, userId: string) {
    const event = await this.db.event.findUnique({
      where: { id: data.eventId },
    });
    if (!event) {
      throw new BadRequestException('Event not found', {
        id: 'The event not found',
      });
    }
    if (event.startDate < new Date()) {
      throw new BadRequestException('Event already started', {
        startDate: 'The event already started',
      });
    }
    if (event.endDate < new Date()) {
      throw new BadRequestException('Event already ended', {
        endDate: 'The event already ended',
      });
    }

    if (event.isPaid && !data.paymentMethod) {
      throw new BadRequestException('Payment method is required', {
        paymentMethod: 'The payment method is required',
      });
    }

    const user = await this.db.user.findUnique({
      where: { id: userId },
    });

    if (event.isPaid && data.paymentMethod) {
      switch (data.paymentMethod) {
        case 'khalti':
          const payment = await this.db.payment.create({
            data: {
              event: {
                connect: {
                  id: event.id,
                },
              },
              user: {
                connect: {
                  id: user.id,
                },
              },
              amount: event.cost * 100,
              paymentMethod: data.paymentMethod,
              paymentStatus: PaymentStatus.PENDING,
            },
          });
          const khaltiResponse = await this.ks.initiatePayment({
            amount: event.cost * 100,
            customer_info: {
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: user.phone,
            },
            purchase_order_id: payment.id,
            purchase_order_name: event.title,
            return_url: `${process.env.FRONTEND_URL}/events/${event.id}/payment-status`,
            website_url: process.env.FRONTEND_URL,
          });
          await this.db.payment.update({
            where: { id: payment.id },
            data: { transactionId: khaltiResponse.pidx },
          });

          return {
            message: 'Payment initiated',
            data: {
              paymentId: payment.id,
              paymentUrl: khaltiResponse.payment_url,
            },
          };

        default:
          throw new BadRequestException('Payment method is not allowed', {
            paymentMethod: 'The payment method is not allowed',
          });
      }
    }

    const attendee = await this.db.userEvent.create({
      data: {
        eventId: data.eventId,
        userId: userId,
        status: ParticipantStatus.ACTIVE,
      },
    });

    this.eventEmitter.emitAsync('event.joined', attendee.id);
    return {
      message: 'Event joined',
      data: attendee,
    };
  }

  async verifyEventPayment(pidx: string) {
    const payment = await this.db.payment.findFirst({
      where: { transactionId: pidx },
    });
    if (!payment) {
      throw new BadRequestException('Payment not found', {
        paymentId: 'The payment not found',
      });
    }

    const userEvent = await this.db.userEvent.findFirst({
      where: {
        eventId: payment.eventId,
        userId: payment.userId,
      },
    });

    if (userEvent) {
      return {
        message: 'PAYMENT_ALREADY_VERIFIED',
        data: userEvent,
      };
    }

    const khaltiResponse = await this.ks.lookupPayment(pidx);
    if (khaltiResponse.status === KhaltiPaymentStatus.COMPLETED) {
      const updatedPayment = await this.db.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: PaymentStatus.PAID },
      });
      const userEvent = await this.db.userEvent.create({
        data: {
          eventId: payment.eventId,
          userId: payment.userId,
          status: ParticipantStatus.ACTIVE,
        },
      });
      this.eventEmitter.emitAsync('event.joined', userEvent.id);
      this.logger.log(
        `User ${userEvent.userId} joined event ${userEvent.eventId}`,
      );
      this.logger.log(
        `Payment ${updatedPayment.id} updated to status ${updatedPayment.paymentStatus}`,
      );
      const updatedUserEvent = await this.db.userEvent.update({
        where: { id: userEvent.id },
        data: {
          paymentId: updatedPayment.id,
        },
        include: {
          payment: true,
        },
      });
      return {
        message: 'PAYMENT_VERIFIED',
        data: updatedUserEvent,
      };
    } else {
      await this.db.payment.update({
        where: { id: payment.id },
        data: { paymentStatus: PaymentStatus.FAILED },
      });
      throw new BadRequestException('PAYMENT_NOT_VERIFIED', {
        paymentId: 'The payment not verified',
      });
    }
  }
}
