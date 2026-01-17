import { Module } from '@nestjs/common';
import { DbModule } from 'src/lib/db/db.module';
import { HashModule } from 'src/lib/hash/hash.module';
import { UserAuthModule } from './auth/auth.module';
import { EventModule } from './event/event.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserEventModule } from './user-event/user-event.module';
import { ConversationModule } from './conversation/conversation.module';

@Module({
  imports: [DbModule, HashModule, UserAuthModule, EventModule, UserEventModule, ConversationModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
