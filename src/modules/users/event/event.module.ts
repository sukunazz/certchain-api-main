import { Module } from '@nestjs/common';
import { KhaltiModule } from 'src/lib/khalti/khalti.module';
import { EventController } from './event.controller';
import { EventService } from './event.service';

@Module({
  imports: [KhaltiModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
