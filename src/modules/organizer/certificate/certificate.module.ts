import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { MailModule } from 'src/lib/mail/mail.module';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { CertificateEmailProcessor } from './processors/certificate-email.processor';

const runWorkers = process.env.RUN_WORKERS === 'true';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'certificate_emails',
    }),
    MailModule,
  ],
  controllers: [CertificateController],
  providers: [
    CertificateService,
    ...(runWorkers ? [CertificateEmailProcessor] : []),
  ],
})
export class CertificateModule {}
