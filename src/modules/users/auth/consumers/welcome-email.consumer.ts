import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import UserWelcomeEmail from 'emails/user/user-welcome-email';
import { MailService } from 'src/lib/mail/mail.service';

@Processor('user-welcome-emails')
export class UserWelcomeMailConsumer extends WorkerHost {
  private readonly logger = new Logger(UserWelcomeMailConsumer.name);
  constructor(private readonly mail: MailService) {
    super();
  }

  async process(job: Job<{ email: string; firstName: string }>) {
    const maskedEmail = this.maskEmail(job.data.email);
    this.logger.log(`Processing welcome email for ${maskedEmail}`);
    try {
      await this.mail.send({
        email: job.data.email,
        subject: 'Welcome to CertChain',
        template: UserWelcomeEmail({
          email: job.data.email,
          firstName: job.data.firstName,
        }),
      });
      this.logger.log(`Welcome email sent successfully to ${maskedEmail}`);
    } catch (error) {
      this.logger.error(
        `Failed to send welcome email to ${maskedEmail}`,
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
