import { BullModule } from '@nestjs/bullmq';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EnvService } from 'src/lib/env/env.service';
import { MailModule } from 'src/lib/mail/mail.module';
import { OrganizerModule } from '../organizer.module';
import { TeamMemberModule } from '../team-member/team-member.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OrganizerResetMailConsumer } from './consumers/reset-email.consumer';
import { OrganizerVerificationMailConsumer } from './consumers/verify-email.consumer';
import { ResetService } from './reset.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RtStrategy } from './strategies/rt.strategy';
import { TokensService } from './tokens.service';
import { VerificationService } from './verification.service';

@Module({
  imports: [
    forwardRef(() => OrganizerModule),
    BullModule.registerQueue({
      name: 'organizer-verification-emails',
    }),
    BullModule.registerQueue({
      name: 'organizer-reset-emails',
    }),
    BullModule.registerQueue({
      name: 'organizer-welcome-emails',
    }),
    BullModule.registerQueue({
      name: 'remove-reset-token',
    }),
    BullModule.registerQueue({
      name: 'organizer-password-changed-emails',
    }),
    TeamMemberModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [EnvService],
      useFactory: (config: EnvService) => ({
        secret: config.get('ORGANIZER_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    OrganizerVerificationMailConsumer,
    OrganizerResetMailConsumer,
    JwtStrategy,
    RtStrategy,
    ResetService,
    TokensService,
    VerificationService,
  ],
})
export class AuthModule {}
