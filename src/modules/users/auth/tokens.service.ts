import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from 'src/lib/env/env.service';
import { Tokens } from './auth.interface';

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly config: EnvService,
  ) {}

  async generateTokens(userId: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get('USER_ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      ),
      this.jwt.signAsync(
        { sub: userId },
        {
          secret: this.config.get('USER_REFRESH_TOKEN_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<string> {
    const payload = await this.jwt.verifyAsync(token, {
      secret: this.config.get('USER_ACCESS_TOKEN_SECRET'),
    });
    return payload.sub;
  }

  async verifyRefreshToken(token: string): Promise<string> {
    const payload = await this.jwt.verifyAsync(token, {
      secret: this.config.get('USER_REFRESH_TOKEN_SECRET'),
    });
    return payload.sub;
  }
}
