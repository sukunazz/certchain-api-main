import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { UnauthorizedResponseDto } from 'src/common/dto/unauthorized-response.dto';
import { EnvService } from 'src/lib/env/env.service';
import { TeamMemberWithoutPassword } from '../team-member/team-member.service';
import { OrganizerWithoutPassword } from './auth.interface';
import { AuthService } from './auth.service';
import { clearTokenCookie, setTokenCookie } from './auth.utils';
import { CurrentOrganizer } from './decorators/current-organizer';
import { Public } from './decorators/public';
import { AppLoginDto } from './dto/app-login.dto';
import { ForgotPasswordByEmailDto } from './dto/forgot-password.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verfication.dto';
import { ResetPasswordByEmailDto } from './dto/reset-password.dto';
import { SignInWithOrganizationDto } from './dto/sign-in-with-organization.dto';
import { OrganizerJwtAuthGuard } from './guards/jwt.guard';

@Controller('organizer/auth')
@UseGuards(OrganizerJwtAuthGuard)
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
  type: UnauthorizedResponseDto,
})
@ApiTags('Organizer Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: EnvService,
  ) {}

  @Post('sign-in-with-organization')
  @Public()
  @ApiOperation({ summary: 'Sign in with organization' })
  async signInWithOrganization(@Body() body: SignInWithOrganizationDto) {
    const response = await this.authService.signInWithOrganization(body);

    return {
      data: response.data,
      message: response.message,
    };
  }

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register organizer with email' })
  async register(
    @Body() body: RegisterEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.register(body);
    setTokenCookie(res, response.data.tokens);
    return response;
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login organizer with email' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const response = await this.authService.login(body);
    setTokenCookie(res, response.data.tokens);
    return response;
  }

  @Post('app-login')
  @Public()
  @ApiOperation({ summary: 'Login organizer with app' })
  async appLogin(@Body() body: AppLoginDto) {
    return this.authService.appLogin(body);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password with email' })
  async forgotPassword(@Body() body: ForgotPasswordByEmailDto) {
    return this.authService.sendResetPasswordToken(body);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with email' })
  async resetPassword(@Body() body: ResetPasswordByEmailDto) {
    return this.authService.resetPassword(body);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout organizer' })
  async logout(
    @CurrentOrganizer() organizer: OrganizerWithoutPassword,
    @Res({ passthrough: true }) res: Response,
  ) {
    clearTokenCookie(res);
    return {
      message: 'Logout successful',
    };
  }

  @Post('resend-verification-email')
  @Public()
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerificationEmail(@Body() body: ResendVerificationEmailDto) {
    return this.authService.sendVerificationEmail(body.email);
  }

  @Get('session')
  @ApiOperation({ summary: 'Get session' })
  async session(@CurrentOrganizer() teamMember: TeamMemberWithoutPassword) {
    const teamMemberData = await this.authService.getSession(teamMember.id);
    return {
      data: {
        teamMember: teamMemberData,
      },
      message: 'Session retrieved',
    };
  }
}
