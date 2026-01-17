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
import { CreateUserDto } from '../dto/create-user.dto';
import { UserWithoutPassword } from '../users.service';
import { AuthService } from './auth.service';
import { clearTokenCookie, setTokenCookie } from './auth.utils';
import { CurrentUser } from './decorators/current-user';
import { Public } from './decorators/public';
import { ForgotPasswordByEmailDto } from './dto/forgot-password.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification.dto';
import { ResetPasswordByEmailDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UserJwtAuthGuard } from './guards/jwt.guard';
import { VerificationService } from './verification.service';

@Controller('users/auth')
@UseGuards(UserJwtAuthGuard)
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
  type: UnauthorizedResponseDto,
})
@ApiTags('User Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly verificationService: VerificationService,
  ) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Register user with email' })
  async register(
    @Body() body: CreateUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.register(body);
    setTokenCookie(res, tokens);
    return {
      data: { user, tokens },
      message: 'Registration successful. Please verify your email.',
    };
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login user with email' })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(body);
    setTokenCookie(res, tokens);
    return {
      data: { user, tokens },
      message: 'Login successful',
    };
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot password with email' })
  async forgotPassword(@Body() body: ForgotPasswordByEmailDto) {
    await this.authService.sendResetPasswordToken(body);
    return {
      message: 'Reset password instructions sent to your email',
    };
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with email' })
  async resetPassword(@Body() body: ResetPasswordByEmailDto) {
    await this.authService.resetPassword(body);
    return {
      message: 'Password reset successful',
    };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Res({ passthrough: true }) res: Response) {
    clearTokenCookie(res);
    return {
      message: 'Logout successful',
    };
  }

  @Post('resend-verification-email')
  @Public()
  @ApiOperation({ summary: 'Resend verification email' })
  async resendVerificationEmail(@Body() body: ResendVerificationEmailDto) {
    const token = await this.verificationService.generateToken(body.email);
    await this.verificationService.sendVerificationEmail(body.email, token);
    return {
      message: 'Verification email sent',
    };
  }

  @Get('session')
  @ApiOperation({ summary: 'Get session' })
  @UseGuards(UserJwtAuthGuard)
  async session(@CurrentUser() authUser: UserWithoutPassword) {
    const user = await this.authService.getSession(authUser.id);
    return {
      data: { user },
      message: 'Session retrieved',
    };
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() body: VerifyEmailDto) {
    await this.verificationService.verifyEmail(body.token);
    return {
      message: 'Email verified successfully',
    };
  }
}
