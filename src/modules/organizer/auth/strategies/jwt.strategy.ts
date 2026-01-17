import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EnvService } from 'src/lib/env/env.service';
import { isNil } from 'src/lib/utils/isNil';
import { TeamMemberService } from '../../team-member/team-member.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'organizer-jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private teamMemberService: TeamMemberService,
    private config: EnvService,
  ) {
    const secret = config.get('ORGANIZER_ACCESS_TOKEN_SECRET');
    console.log('JWT Secret:', secret); // Debug log

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) =>
          req.cookies?.[config.get('ORGANIZER_ACCESS_TOKEN_COOKIE_NAME')],
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const user = payload;
    if (isNil(user)) throw new UnauthorizedException();

    const teamMember = await this.teamMemberService.one(user.id);
    if (isNil(teamMember)) throw new UnauthorizedException();
    return teamMember;
  }
}
