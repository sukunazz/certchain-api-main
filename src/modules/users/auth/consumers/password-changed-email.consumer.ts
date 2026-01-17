import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import UserPasswordChangedEmail from 'emails/user/user-password-changed-email';
import { MailService } from 'src/lib/mail/mail.service';

@Processor('user-password-changed-emails')
export class UserPasswordChangedMailConsumer extends WorkerHost {
  private readonly logger = new Logger(UserPasswordChangedMailConsumer.name);
  constructor(private readonly mail: MailService) {
    super();
  }

  async process(job: Job<{ email: string }>) {
    const maskedEmail = this.maskEmail(job.data.email);
    this.logger.log(`Processing password changed email for ${maskedEmail}`);
    try {
      await this.mail.send({
        email: job.data.email,
        subject: 'CertChain | Password Changed',
        template: UserPasswordChangedEmail({
          email: job.data.email,
        }),
      });
      this.logger.log(
        `Password changed email sent successfully to ${maskedEmail}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send password changed email to ${maskedEmail}`,
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
