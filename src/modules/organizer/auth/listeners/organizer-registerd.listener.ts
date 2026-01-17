import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { OrganizerRegisteredEvent } from '../events/OrganizerRegistered';
import { VerificationService } from '../verification.service';

@Injectable()
export class OrganizerRegisteredListener {
  constructor(
    private readonly verificationService: VerificationService,
    @InjectQueue('organizer-verification-emails')
    private verificationEmailsQueue: Queue,
  ) {}

  @OnEvent('organizer.registered', {
    async: true,
  })
  async handleOrganizerRegisteredEvent(event: OrganizerRegisteredEvent) {
    try {
      console.log('Organizer registered event received', event);
      try {
        await this.verificationService.sendEmailVerification(
          event.teamMember.email,
        );
      } catch (error) {
        console.error(error);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
