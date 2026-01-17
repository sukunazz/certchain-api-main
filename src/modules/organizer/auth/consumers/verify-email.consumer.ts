import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import OrganizerVerificationEmail from 'emails/organizer/organizer-verification-email';
import { MailService } from 'src/lib/mail/mail.service';

@Processor('organizer-verification-emails')
export class OrganizerVerificationMailConsumer extends WorkerHost {
  private readonly logger = new Logger(OrganizerVerificationMailConsumer.name);
  constructor(private readonly mail: MailService) {
    super();
  }

  async process(job: Job<{ email: string; code: string }>) {
    const maskedEmail = this.maskEmail(job.data.email);
    this.logger.log(`Processing reset email for ${maskedEmail}`);
    try {
      await this.mail.send({
        email: job.data.email,
        subject: 'CertChain | Verify your email',
        template: OrganizerVerificationEmail({
          email: job.data.email,
          code: job.data.code,
        }),
      });
      this.logger.log(`Verification email sent successfully to ${maskedEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${maskedEmail}`,
        error.stack,
      );
    }
    return true;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const maskedLocal =
      local.charAt(0) +
      '*'.repeat(local.length - 2) +
      local.charAt(local.length - 1);
    return `${maskedLocal}@${domain}`;
  }
}
