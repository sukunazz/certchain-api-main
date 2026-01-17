import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from 'src/lib/env/env.service';
import { isNil } from 'src/lib/utils/isNil';

@Injectable()
export class RtStrategy extends PassportStrategy(
  Strategy,
  'admin-jwt-refresh',
) {
  private readonly logger = new Logger(RtStrategy.name);
  constructor(private config: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('ORGANIZER_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request) {
    const refresh_token =
      req.cookies[this.config.get('ORGANIZER_REFRESH_TOKEN_COOKIE_NAME')] ||
      req.headers.authorization.split(' ')[1];
    this.logger.debug(refresh_token);
    // check if user exists and access_token is not malformed
    // const user = await this.organizerService.getById(payload.sub);
    // this.logger.log({
    //   payload,
    //   user,
    // });
    const user = {
      id: '1',
      email: 'test@test.com',
      name: 'test',
    };
    if (isNil(user)) throw new UnauthorizedException();

    return {
      ...user,
      refresh_token,
    };
  }
}
