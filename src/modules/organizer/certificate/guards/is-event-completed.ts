import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DbService } from 'src/lib/db/db.service';

@Injectable()
export class IsEventCompletedGuard implements CanActivate {
  constructor(private readonly db: DbService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const eventId =
      request.params.eventId || request.query.eventId || request.body.eventId;

    if (!eventId) {
      return false;
    }

    const event = await this.db.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        completedAt: true,
      },
    });

    if (!event) {
      return false;
    }

    return event.completedAt !== null;
  }
}
