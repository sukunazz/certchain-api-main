import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { EnvService } from 'src/lib/env/env.service';
import { IS_PUBLIC_KEY } from '../decorators/public';

@Injectable()
export class OrganizerJwtAuthGuard extends AuthGuard('organizer-jwt') {
  logger = new Logger(OrganizerJwtAuthGuard.name);
  constructor(
    private readonly reflector: Reflector,
    private readonly env: EnvService,
  ) {
    super();
  }
  // This method is run before the controller method is run
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get the metadata for this controller method
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // If the metadata is set to true, then this method is public
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();

    const token =
      request.cookies?.[this.env.get('ORGANIZER_ACCESS_TOKEN_COOKIE_NAME')] ??
      request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException(
        JSON.stringify({
          message: 'Auth header not found - organizer',
          authorization: request.headers.authorization,
          cookies:
            request.cookies?.[process.env.ADMIN_ACCESS_TOKEN_COOKIE_NAME],
        }),
      );
    }
    // If the request has an Authorization header, run the default authentication logic
    return super.canActivate(context);
  }
}
