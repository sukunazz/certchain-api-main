import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Queue } from 'bullmq';
import { EnvService } from 'src/lib/env/env.service';
import { UsersService } from '../users.service';

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: EnvService,
    private readonly usersService: UsersService,
    @InjectQueue('user-verification-emails')
    private readonly verificationQueue: Queue,
    @InjectQueue('user-welcome-emails')
    private readonly welcomeQueue: Queue,
  ) {}

  async generateToken(email: string): Promise<string> {
    return this.jwt.signAsync(
      { email },
      {
        secret: this.config.get('USER_VERIFICATION_TOKEN_SECRET'),
        expiresIn: this.config.get('JWT_VERIFICATION_TOKEN_EXPIRES_IN'),
      },
    );
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('USER_VERIFICATION_TOKEN_SECRET'),
      });

      const user = await this.usersService.findByEmail(payload.email);

      if (user.isVerified) {
        throw new UnauthorizedException('Email already verified');
      }

      await this.usersService.update(user.id, { isVerified: true });

      await this.welcomeQueue.add('send-welcome-email', {
        email: user.email,
        firstName: user.firstName,
      });

      return true;
    } catch (error) {
      this.logger.error('Error verifying email', error.stack);
      throw new UnauthorizedException('Invalid or expired verification token');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);

    if (user.isVerified) {
      throw new UnauthorizedException('Email already verified');
    }

    await this.verificationQueue.add('send-verification-email', {
      email: user.email,
      firstName: user.firstName,
      value: token,
    });
  }
}
