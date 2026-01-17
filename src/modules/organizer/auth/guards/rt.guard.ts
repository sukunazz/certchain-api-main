import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class OrganizerRtAuthGuard extends AuthGuard('organizer-jwt-refresh') {
  constructor() {
    super();
  }

  // This method is run before the controller method is run
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Get the request object
    const request = context.switchToHttp().getRequest();

    // If the request does not have an Authorization header, throw an error
    if (!request.headers.authorization) {
      throw new UnauthorizedException('Missing Authorization header r2');
    }
    // If the request has an Authorization header, run the default authentication logic
    return super.canActivate(context);
  }
}
