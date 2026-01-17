import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CertificateModule } from './certificate/certificate.module';
import { ConversationModule } from './conversation/conversation.module';
import { EventModule } from './event/event.module';
import { OrganizerController } from './organizer.controller';
import { OrganizerService } from './organizer.service';
import { TeamMemberModule } from './team-member/team-member.module';
import { UserEventModule } from './user-event/user-event.module';

@Module({
  imports: [
    TeamMemberModule,
    ConversationModule,
    AuthModule,
    EventModule,
    CertificateModule,
    UserEventModule,
  ],
  providers: [OrganizerService],
  controllers: [OrganizerController],
  exports: [OrganizerService],
})
export class OrganizerModule {}
