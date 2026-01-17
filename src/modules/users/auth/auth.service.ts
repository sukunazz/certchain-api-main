import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BadRequestException } from 'src/lib/exceptions/bad-request.exception';
import { HashService } from 'src/lib/hash/hash.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../users.service';
import { ForgotPasswordByEmailDto } from './dto/forgot-password.dto';
import { LoginEmailDto } from './dto/login-email.dto';
import { ResetPasswordByEmailDto } from './dto/reset-password.dto';
import { ResetService } from './reset.service';
import { TokensService } from './tokens.service';
import { VerificationService } from './verification.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly tokensService: TokensService,
    private readonly resetService: ResetService,
    private readonly verificationService: VerificationService,
    @InjectQueue('user-verification-emails')
    private readonly verificationQueue: Queue,
    @InjectQueue('user-reset-emails')
    private readonly resetQueue: Queue,
    @InjectQueue('user-welcome-emails')
    private readonly welcomeQueue: Queue,
    @InjectQueue('user-password-changed-emails')
    private readonly passwordChangedQueue: Queue,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const tokens = await this.tokensService.generateTokens(user.id);
    const verificationToken = await this.verificationService.generateToken(
      user.email,
    );

    this.logger.log(`Sending verification email to ${user.email}`);
    this.logger.log(`Verification token: ${verificationToken}`);

    await this.verificationQueue.add('send-verification-email', {
      email: user.email,
      firstName: user.firstName,
      value: verificationToken,
    });

    return { user, tokens };
  }

  async login(loginDto: LoginEmailDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    const isPasswordValid = await this.hashService.verify(
      user.password,
      loginDto.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials', {
        password: 'Invalid credentials',
      });
    }

    const tokens = await this.tokensService.generateTokens(user.id);
    const userWithoutPassword = await this.usersService.findById(user.id);

    return { user: userWithoutPassword, tokens };
  }

  async sendResetPasswordToken(forgotPasswordDto: ForgotPasswordByEmailDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    const token = await this.resetService.generateToken(user.email);

    await this.resetQueue.add('send-reset-email', {
      email: user.email,
      value: token,
    });

    return true;
  }

  async resetPassword(resetPasswordDto: ResetPasswordByEmailDto) {
    if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const email = await this.resetService.verifyToken(resetPasswordDto.token);
    const user = await this.usersService.findByEmail(email);

    const hashedPassword = await this.hashService.hash(
      resetPasswordDto.password,
    );
    await this.usersService.update(user.id, { password: hashedPassword });

    await this.passwordChangedQueue.add('send-password-changed-email', {
      email: user.email,
    });

    return true;
  }

  async getSession(userId: string) {
    return await this.usersService.findById(userId);
  }
}
