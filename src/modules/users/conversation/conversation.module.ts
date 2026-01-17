import { Module } from '@nestjs/common';
import { AiModule } from 'src/lib/ai/ai.module';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ChatGateway } from './gateways/chat.gateway';

@Module({
  controllers: [ConversationController],
  imports: [AiModule],
  providers: [ConversationService, ChatGateway],
})
export class ConversationModule {}
