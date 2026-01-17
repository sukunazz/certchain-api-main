import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TeamMember } from '@prisma/client';
import { EnvService } from 'src/lib/env/env.service';
import { ITokens } from 'src/modules/core/interfaces/tokens';

@Injectable()
export class TokensService {
  logger = new Logger(TokensService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: EnvService,
  ) {}
  async generate(payload: Partial<TeamMember>): Promise<ITokens> {
    try {
      const accessToken = await this.generateAccessToken(payload);
      const refreshToken = await this.generateRefreshToken(payload);

      const expiryInMs = this.getExpiryInMs(accessToken);

      return { accessToken, refreshToken, expiresIn: expiryInMs };
    } catch (error) {
      this.logger.error(error);
    }
  }

  generateAccessToken(payload: Partial<TeamMember>): Promise<string> {
    const userInfo = {
      ...payload,
    };
    return this.jwtService.signAsync(userInfo, {
      secret: this.configService.get('ORGANIZER_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
    });
  }

  generateRefreshToken(payload: Partial<TeamMember>): Promise<string> {
    const userInfo = {
      ...payload,
    };
    return this.jwtService.signAsync(userInfo, {
      secret: this.configService.get('ORGANIZER_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN'),
    });
  }

  generateInvitationToken(payload: Partial<TeamMember>): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('ORGANIZER_INVITATION_TOKEN_SECRET'),
      expiresIn: this.configService.get('JWT_INVITATION_TOKEN_EXPIRES_IN'),
    });
  }

  verifyInvitationToken(token: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: this.configService.get('ORGANIZER_INVITATION_TOKEN_SECRET'),
    });
  }

  getExpiryInMs(token: string): number {
    const decoded = this.jwtService.decode(token);
    return decoded.exp;
  }
}
