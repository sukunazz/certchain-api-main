import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { DbService } from 'src/lib/db/db.service';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import {
  getPrismaError,
  isPrismaUniqueConstraintViolation,
} from 'src/lib/utils/prismaError';
import { TeamMemberService } from '../team-member/team-member.service';
import { AppLoginDto } from './dto/app-login.dto';
import { ForgotPasswordByEmailDto } from './dto/forgot-password.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { ResetPasswordByEmailDto } from './dto/reset-password.dto';
import { SignInWithOrganizationDto } from './dto/sign-in-with-organization.dto';
import { OrganizerRegisteredEvent } from './events/OrganizerRegistered';
import { ResetService } from './reset.service';
import { TokensService } from './tokens.service';
import { VerificationService } from './verification.service';

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);
  constructor(
    private readonly tokensService: TokensService,
    private readonly resetService: ResetService,
    @InjectQueue('remove-reset-token') private removeResetTokenQueue: Queue,
    @InjectQueue('organizer-password-changed-emails')
    private passwordChangedEmailsQueue: Queue,
    private readonly verificationService: VerificationService,
    private readonly eventEmitter: EventEmitter2,
    private readonly db: DbService,
    private readonly teamMemberService: TeamMemberService,
  ) {}

  async signInWithOrganization(
    signInWithOrganizationDto: SignInWithOrganizationDto,
  ) {
    const organizer = await this.db.organizer.findUnique({
      where: {
        subdomain: signInWithOrganizationDto.subdomain,
      },
    });

    if (!organizer) {
      throw new BadRequestException('Organizer not found', {
        subdomain: 'Organizer not found',
      });
    }

    return {
      data: organizer,
      message: 'Organizer found',
    };
  }

  async register(registerDto: RegisterEmailDto) {
    try {
      const organizer = await this.db.organizer.create({
        data: {
          email: registerDto.organizationContactEmail,
          name: registerDto.organizationName,
          subdomain: registerDto.subdomain,
          phone: registerDto.phone,
        },
      });

      if (!organizer) {
        throw new BadRequestException('Failed to create organizer');
      }

      const teamMember = await this.teamMemberService.create({
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
        organizerId: organizer.id,
      });

      await this.verificationService.sendEmailVerification(teamMember.email);

      await this.eventEmitter.emitAsync(
        'organizer.registered',
        new OrganizerRegisteredEvent(teamMember),
      );
      const tokens = await this.tokensService.generate(teamMember);
      return {
        data: {
          organizer,
          teamMember,
          tokens,
        },
      };
    } catch (error) {
      if (isPrismaUniqueConstraintViolation(error)) {
        const errorMessage = getPrismaError(error);
        const modelName = errorMessage.meta?.modelName;
        const target = errorMessage.meta?.target as string[];
        if (modelName === 'Organizer') {
          if (target.includes('email')) {
            throw new BadRequestException('Organizer already exists', {
              email: 'Organizer already exists',
            });
          }
          if (target.includes('subdomain')) {
            throw new BadRequestException('Subdomain already exists', {
              subdomain: 'Subdomain already exists',
            });
          }
          if (target.includes('phone')) {
            throw new BadRequestException('Phone already exists', {
              phone: 'Phone already exists',
            });
          }
        }
        if (modelName === 'TeamMember') {
          if (target.includes('email')) {
            throw new BadRequestException('Team member already exists', {
              email: 'Team member already exists',
            });
          }
          if (target.includes('phone')) {
            throw new BadRequestException('Team member already exists', {
              phone: 'Team member already exists',
            });
          }
        }
      }
      this.logger.error(
        {
          message: error.message,
          stack: error.stackTrace,
        },
        error.message,
      );
      throw new BadRequestException(error.message, {
        error: error.message,
        stack: error.stackTrace,
      });
    }
  }

  async login(loginDto: LoginEmailDto) {
    this.logger.log('loginEmail', loginDto.email);
    const teamMember = await this.teamMemberService.validateEmailPassword(
      loginDto.email,
      loginDto.password,
      loginDto.organizerId,
    );
    const tokens = await this.tokensService.generate(teamMember);
    return {
      data: {
        teamMember,
        tokens,
      },
    };
  }

  async appLogin(appLoginDto: AppLoginDto) {
    const organizer = await this.db.organizer.findUnique({
      where: {
        subdomain: appLoginDto.organizerSubDomain,
      },
    });

    if (!organizer) {
      throw new BadRequestException('Organizer not found', {
        subdomain: 'Organizer not found',
      });
    }

    const teamMember = await this.teamMemberService.validateEmailPassword(
      appLoginDto.email,
      appLoginDto.password,
      organizer.id,
    );
    const tokens = await this.tokensService.generate(teamMember);
    return {
      data: {
        teamMember,
        tokens,
      },
    };
  }

  async sendResetPasswordToken(forgotPasswordDto: ForgotPasswordByEmailDto) {
    const { email } = forgotPasswordDto;
    await this.resetService.sendResetEmail(email);
    return {
      message: 'Reset password email sent',
    };
  }

  async sendVerificationEmail(email: string) {
    await this.verificationService.sendEmailVerification(email);
    return {
      message: 'Verification email sent',
    };
  }

  async getSession(teamMemberId: string) {
    return this.db.teamMember.findUnique({
      where: {
        id: teamMemberId,
      },
      omit: {
        password: true,
      },
    });
  }

  async resetPassword(resetPasswordDto: ResetPasswordByEmailDto) {
    const organizer =
      await this.teamMemberService.resetPassword(resetPasswordDto);
    if (organizer) {
      await this.removeResetTokenQueue.add('remove-reset-token', {
        email: resetPasswordDto.email,
      });
      await this.passwordChangedEmailsQueue.add('send-password-changed-email', {
        email: resetPasswordDto.email,
      });
      return {
        message: 'Password reset successfully',
      };
    }

    throw new BadRequestException('Invalid token', {
      token: 'Invalid token',
    });
  }
}
