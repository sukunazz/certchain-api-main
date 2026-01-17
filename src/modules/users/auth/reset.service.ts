import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from 'src/lib/env/env.service';

@Injectable()
export class ResetService {
  private readonly logger = new Logger(ResetService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: EnvService,
  ) {}

  async generateToken(email: string): Promise<string> {
    return this.jwt.signAsync(
      { email },
      {
        secret: this.config.get('USER_RESET_PASSWORD_TOKEN_SECRET'),
        expiresIn: this.config.get('JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN'),
      },
    );
  }

  async verifyToken(token: string): Promise<string> {
    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get('USER_RESET_PASSWORD_TOKEN_SECRET'),
      });

      return payload.email;
    } catch (error) {
      this.logger.error('Error verifying reset token', error.stack);
      throw new UnauthorizedException('Invalid or expired reset token');
    }
  }
}
