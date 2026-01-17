import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Queue } from 'bullmq';
import dayjs from 'dayjs';
import { DbService } from 'src/lib/db/db.service';
import { EnvService } from 'src/lib/env/env.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  constructor(
    private readonly db: DbService,
    private readonly config: EnvService,
    private readonly jwtService: JwtService,
    @InjectQueue('organizer-verification-emails') private readonly queue: Queue,
    @InjectQueue('organizer-welcome-emails')
    private readonly welcomeQueue: Queue,
  ) {}

  async verifyEmail(email: string, token: string) {
    const verificationToken = await this.db.verificationToken.findUnique({
      where: { email },
    });
    if (!verificationToken) {
      throw new BadRequestException('Verification token not found');
    }
    const verify = await this.jwtService.verify(token, {
      secret: this.config.get('ORGANIZER_VERIFICATION_TOKEN_SECRET'),
    });
    if (!verify) {
      throw new BadRequestException('Invalid verification token');
    }
    if (dayjs(verificationToken.expiresAt).isBefore(dayjs())) {
      throw new BadRequestException('Verification token expired');
    }

    const teamMember = await this.db.teamMember.findUnique({
      where: { email },
    });
    if (!teamMember) {
      throw new BadRequestException('Team member not found');
    }
    if (teamMember.verifiedAt) {
      throw new BadRequestException('Team member already verified');
    }
    await this.db.teamMember.update({
      where: { email },
      data: {
        verifiedAt: new Date(),
      },
    });
    await this.removeVerificationToken(email);
    await this.welcomeQueue.add('welcome-email', {
      email,
      firstName: teamMember.name,
    });
    return true;
  }

  async sendEmailVerification(email: string) {
    await this.sendMail(email);
  }

  async sendMail(email: string) {
    const code = this.jwtService.sign(
      { email },
      { secret: this.config.get('ORGANIZER_VERIFICATION_TOKEN_SECRET') },
    );
    const teamMember = await this.db.teamMember.findUnique({
      where: { email },
    });
    if (!teamMember) {
      throw new BadRequestException('Team member not found', {
        email: 'The email address is not registered',
      });
    }
    if (teamMember.verifiedAt) {
      return;
    }

    const expiryDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

    await this.db.verificationToken.upsert({
      where: { email },
      update: {
        token: code,
      },
      create: {
        token: code,
        email,
        expiresAt: expiryDate,
      },
    });
    const added = await this.queue.add('verification-email', {
      email,
      code: this.config.get('ORGANIZER_VERIFICATION_URL') + code,
    });
    this.logger.log('added', added);
    return {
      message: 'Verification email sent',
    };
  }

  async removeVerificationToken(email: string) {
    await this.db.verificationToken.delete({
      where: { email },
    });
  }
}
