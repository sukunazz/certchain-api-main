import { Injectable, Logger } from '@nestjs/common';
import { Organizer } from '@prisma/client';
import { DbService } from 'src/lib/db/db.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import { NotFoundException } from 'src/lib/exceptions/not-found.exception';
import { Pagination } from 'src/lib/pagination/paginate';
import {
  isPrismaNotFound,
  isPrismaUniqueConstraintViolation,
} from 'src/lib/utils/prismaError';
import { RegisterEmailDto } from './auth/dto/register-email.dto';
import { UpdateOrganizerDto } from './dto/update-organizer.dto';

@Injectable()
export class OrganizerService {
  private readonly logger = new Logger(OrganizerService.name);
  constructor(protected readonly db: DbService) {}

  public async create(data: RegisterEmailDto): Promise<Organizer> {
    return await this.db.organizer.create({
      data: {
        email: data.organizationContactEmail.toLowerCase(),
        phone: data.phone || '',
        subdomain: data.subdomain,
        type: data.type,
        name: data.organizationName,
      },
    });
  }

  public async all(params: Pagination): Promise<[Organizer[], number]> {
    const [items, count] = await this.db.$transaction([
      this.db.organizer.findMany({
        ...params,
        where: params.where,
      }),
      this.db.organizer.count({
        where: params.where,
      }),
    ]);
    return [items, count];
  }

  public async one(id: string) {
    const organizer = await this.db.organizer.findUnique({
      where: { id },
    });
    const analytics = await this.aggregateAnalytics(organizer?.id);
    return { ...organizer, analytics };
  }

  public async update(
    id: string,
    data: UpdateOrganizerDto,
  ): Promise<Organizer> {
    try {
      return await this.db.organizer.update({
        where: { id },
        data: data,
      });
    } catch (error) {
      if (isPrismaUniqueConstraintViolation(error)) {
        const uniqueField = error.meta.target[0];
        throw new BadRequestException(
          `${uniqueField.charAt(0).toUpperCase() + uniqueField.slice(1)} already exists`,
          {
            [uniqueField]: `The ${uniqueField} is already in use`,
          },
        );
      }
      if (isPrismaNotFound(error)) {
        throw new NotFoundException('Organizer not found');
      }
      throw new BadRequestException('Failed to update organizer');
    }
  }

  public async remove(id: string): Promise<Organizer> {
    return await this.db.organizer.delete({
      where: { id },
    });
  }

  public async oneByDomain(domain: string) {
    const domainName = new URL(`https://${domain}`);
    this.logger.log(domainName);
    const rootDomain = process.env.DOMAIN as string;

    if (domainName.host.endsWith(rootDomain)) {
      const subdomain = domainName.host.slice(0, -(rootDomain.length + 1));
      const organizer = await this.db.organizer.findFirst({
        where: {
          subdomain: {
            equals: subdomain,
            mode: 'insensitive',
          },
        },
      });

      const analytics = await this.aggregateAnalytics(organizer?.id);

      return { ...organizer, analytics };
    }

    const organizerDomain = await this.db.organizerDomain.findFirst({
      where: { domain: domainName.host },
      include: { organizer: true },
    });
    return organizerDomain?.organizer;
  }

  public async aggregateAnalytics(organizerId: string) {
    const events = await this.db.event.findMany({
      where: { organizerId },
      include: {
        userEvents: true,
        certificates: true,
      },
    });

    const totalRevenue = events.reduce((acc, event) => acc + event.cost, 0);
    const totalParticipants = events.reduce(
      (acc, event) => acc + event.userEvents.length,
      0,
    );
    const totalCertificates = events.reduce(
      (acc, event) => acc + event.certificates.length,
      0,
    );
    const certificateRate = totalCertificates / totalParticipants;

    return {
      totalRevenue,
      totalEvents: events.length,
      totalParticipants,
      totalCertificates,
      certificateRate,
    };
  }
}
