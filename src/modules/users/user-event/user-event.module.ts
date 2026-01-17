import { Module } from '@nestjs/common';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';

@Module({
  controllers: [UserEventController],
  providers: [UserEventService],
})
export class UserEventModule {}
