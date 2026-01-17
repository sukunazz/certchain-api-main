import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomInt } from 'crypto';
import { sign, verify } from 'jsonwebtoken';
import { DbService } from 'src/lib/db/db.service';
import { EnvService } from 'src/lib/env/env.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';

@Injectable()
export class ResetService {
  private readonly logger = new Logger(ResetService.name);
  constructor(
    private readonly db: DbService,
    @InjectQueue('organizer-reset-emails') private readonly queue: Queue,
    private readonly config: EnvService,
  ) {}

  async generateResetToken() {
    return randomInt(100000, 999999);
  }

  async generateResetJWT(email: string) {
    const secret = this.config.get('ORGANIZER_RESET_PASSWORD_TOKEN_SECRET');
    this.logger.log('secret', secret);
    const expiresIn = this.config.get('JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN');
    return sign({ email }, secret, { expiresIn });
  }

  async setResetToken(email: string, token: string) {
    await this.db.resetPasswordToken.upsert({
      where: { email },
      create: {
        email,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
      update: {
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      },
    });
  }

  async verifyResetToken(email: string, token: string) {
    this.logger.log('verifyResetToken', email, token);
    if (token.length === 6) {
      // Handle numeric code verification
      const resetToken = await this.db.resetPasswordToken.findUnique({
        where: { email },
      });
      if (!resetToken || resetToken.token !== token) {
        throw new BadRequestException('Invalid token', {
          root: 'You have entered an invalid token',
        });
      }
      if (resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Token expired', {
          root: 'Your token has expired',
        });
      }
    } else {
      // Handle JWT verification

      const secret = this.config.get('ORGANIZER_RESET_PASSWORD_TOKEN_SECRET');
      this.logger.log('secret', secret);
      const decoded = verify(token, secret) as { email: string };
      this.logger.log('decoded', decoded);
      if (decoded.email !== email) {
        throw new BadRequestException('Invalid token', {
          root: 'Invalid reset token',
        });
      }
    }
    return true;
  }

  async sendResetEmail(email: string) {
    const teamMember = await this.db.teamMember.findFirst({
      where: {
        email,
      },
    });
    if (!teamMember) {
      throw new BadRequestException('Team member not found', {
        email: 'The user is not registered with this email.',
      });
    }
    const jwt = await this.generateResetJWT(email);
    // Add a separator between base URL and token
    const resetValue = `${this.config.get('APP_URL')}/organizers/${teamMember.organizerId}/auth/reset-password?token=${jwt}`;

    const added = await this.queue.add('organizer-reset-email', {
      email,
      value: resetValue,
    });
    this.logger.log('added', added);
    return {
      message: 'Reset password email sent',
    };
  }

  async removeResetToken(email: string) {
    await this.db.resetPasswordToken.delete({
      where: { email },
    });
  }
}
