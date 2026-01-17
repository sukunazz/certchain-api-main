import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DbService } from 'src/lib/db/db.service';
import { Pagination } from 'src/lib/pagination/paginate';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Injectable()
export class CertificateService {
  constructor(
    private readonly db: DbService,
    @InjectQueue('certificate_emails') private readonly emailQueue: Queue,
  ) {}

  async create(createCertificateDto: CreateCertificateDto) {
    const userEvent = await this.db.userEvent.findFirst({
      where: {
        eventId: createCertificateDto.eventId,
        userId: createCertificateDto.userId,
      },
    });

    if (!userEvent) {
      throw new NotFoundException('User event not found');
    }

    const certificate = await this.db.certificate.create({
      data: {
        eventId: createCertificateDto.eventId,
        userId: createCertificateDto.userId,
        userEventId: userEvent.id,
      },
      include: {
        event: {
          include: {
            organizer: true,
          },
        },
        user: true,
      },
    });

    // Queue email sending
    await this.emailQueue.add('send-certificate', {
      certificate,
    });

    return {
      certificate,
      message: 'Certificate created and email queued',
    };
  }

  async createBulkCertificates(eventId: string) {
    // Get all users who joined the event
    const userEvents = await this.db.userEvent.findMany({
      where: {
        eventId,
        status: 'ACTIVE',
      },
      include: {
        user: true,
      },
    });

    const certificates = await Promise.allSettled(
      userEvents.map(async (userEvent) => {
        try {
          const certificate = await this.db.certificate.create({
            data: {
              eventId,
              userId: userEvent.userId,
              userEventId: userEvent.id,
            },
            include: {
              event: {
                include: {
                  organizer: true,
                },
              },
              user: true,
            },
          });

          // Queue email sending for each certificate
          await this.emailQueue.add('send-certificate', {
            certificate,
          });

          return certificate;
        } catch (error) {
          // Skip if certificate already exists
          if (error.code === 'P2002') {
            return null;
          }
          throw error;
        }
      }),
    );

    return certificates.filter(Boolean);
  }

  async createBulkCertificatesForSelectedUsers(
    eventId: string,
    userIds: string[],
  ) {
    const certificates = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const userEvent = await this.db.userEvent.findFirst({
            where: {
              eventId,
              userId,
            },
          });

          const certificate = await this.db.certificate.create({
            data: {
              eventId,
              userId,
              userEventId: userEvent.id,
            },
            include: {
              event: {
                include: {
                  organizer: true,
                },
              },
              user: true,
            },
          });

          // Queue email sending for each certificate
          await this.emailQueue.add('send-certificate', {
            certificate,
          });

          return certificate;
        } catch (error) {
          // Skip if certificate already exists
          if (error.code === 'P2002') {
            return null;
          }
          throw error;
        }
      }),
    );

    return certificates.filter(Boolean);
  }

  async findAll(eventId: string, pagination: Pagination) {
    return await this.db.$transaction([
      this.db.certificate.findMany({
        ...pagination,
        where: {
          eventId,
          ...pagination.where,
        },
        include: {
          user: true,
          event: {
            include: {
              organizer: true,
            },
          },
        },
      }),
      this.db.certificate.count({
        where: {
          eventId,
          ...pagination.where,
        },
      }),
    ]);
  }

  async findOne(id: string) {
    return this.db.certificate.findUnique({
      where: { id },
      include: {
        user: true,
        event: {
          include: {
            organizer: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    return this.db.certificate.delete({
      where: { id },
    });
  }
}
