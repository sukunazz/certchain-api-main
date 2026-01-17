import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from 'src/lib/env/env.service';
import { UsersService } from '../../users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'user-jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly config: EnvService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) =>
          req.cookies?.[config.get('USER_ACCESS_TOKEN_COOKIE_NAME')],
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get('USER_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error('Error validating token', error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
