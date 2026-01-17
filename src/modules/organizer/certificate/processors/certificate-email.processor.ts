import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as dayjs from 'dayjs';
import CertificateEmail from 'emails/user/certificate-email';
import { MailService } from 'src/lib/mail/mail.service';

@Processor('certificate_emails')
export class CertificateEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificateEmailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job) {
    try {
      this.logger.log(`Processing certificate email job ${job.id}`);

      const { certificate } = job.data;
      const { user, event } = certificate;

      this.logger.debug('Certificate data:', {
        certificateId: certificate.id,
        userId: user.id,
        eventId: event.id,
        eventTitle: event.title,
      });

      const certificateUrl = `${process.env.FRONTEND_URL}/certificates/${certificate.id}`;

      this.logger.log(`Sending certificate email to ${user.email}`);

      await this.mailService.send({
        email: user.email,
        subject: `Your Certificate for ${event.title} is Ready!`,
        template: CertificateEmail({
          userName: `${user.firstName} ${user.lastName}`,
          eventName: event.title,
          certificateId: certificate.id,
          eventDate: dayjs(event.endDate).format('MMMM DD, YYYY'),
          organizerName: event.organizer.name,
          certificateUrl,
        }),
      });

      this.logger.log(`Successfully sent certificate email to ${user.email}`);

      return true;
    } catch (error) {
      this.logger.error(
        `Error processing certificate email job ${job.id}:`,
        error,
      );
      throw error;
    }
  }
}
