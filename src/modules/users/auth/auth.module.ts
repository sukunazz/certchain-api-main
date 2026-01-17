import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from 'src/lib/env/env.service';
import { HashModule } from 'src/lib/hash/hash.module';
import { MailModule } from 'src/lib/mail/mail.module';
import { UsersModule } from '../users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserPasswordChangedMailConsumer } from './consumers/password-changed-email.consumer';
import { UserResetMailConsumer } from './consumers/reset-email.consumer';
import { UserVerificationMailConsumer } from './consumers/verify-email.consumer';
import { UserWelcomeMailConsumer } from './consumers/welcome-email.consumer';
import { ResetService } from './reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { TokensService } from './tokens.service';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    HashModule,
    BullModule.registerQueue({
      name: 'user-verification-emails',
    }),
    BullModule.registerQueue({
      name: 'user-reset-emails',
    }),
    BullModule.registerQueue({
      name: 'user-welcome-emails',
    }),
    BullModule.registerQueue({
      name: 'remove-reset-token',
    }),
    BullModule.registerQueue({
      name: 'user-password-changed-emails',
    }),
    MailModule,
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (config: EnvService) => ({
        secret: config.get('USER_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserVerificationMailConsumer,
    UserResetMailConsumer,
    UserWelcomeMailConsumer,
    UserPasswordChangedMailConsumer,
    JwtStrategy,
    RtStrategy,
    ResetService,
    TokensService,
    VerificationService,
  ],
  exports: [AuthService],
})
export class UserAuthModule {}
