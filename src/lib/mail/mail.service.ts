import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { render } from '@react-email/render';
import { APP_CONFIG } from 'src/app.config';
import { EnvService } from '../env/env.service';

interface SendMailConfiguration {
  email: string;
  subject: string;
  text?: string;
  template: any;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private config: EnvService,
    private mailerService: MailerService,
  ) {}

  renderTemplate(template: any) {
    return {
      html: render(template, {
        pretty: true,
      }),
      text: render(template, {
        plainText: true,
      }),
    };
  }

  async send({ email, subject, template }: SendMailConfiguration) {
    const { html, text } = this.renderTemplate(template);

    try {
      await this.mailerService.sendMail({
        from: `${APP_CONFIG.NAME} <${process.env.MAIL_FROM}>`,
        to: email,
        subject,
        html,
        text,
      });
      this.logger.log('send', email);
    } catch (error) {
      this.logger.error('send', error);
    }
  }
}
