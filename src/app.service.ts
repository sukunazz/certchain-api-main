import { Injectable } from '@nestjs/common';
import { DbService } from './lib/db/db.service';

@Injectable()
export class AppService {
  constructor(private readonly db: DbService) {}
  getHello(): string {
    return 'Hello World!';
  }

  getCertificate(id: string) {
    return this.db.certificate.findUnique({
      where: {
        id,
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
  }
}
