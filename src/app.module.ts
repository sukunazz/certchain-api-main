import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';

import { ClsModule } from 'nestjs-cls';
import { AppService } from './app.service';
import { configValidationSchema } from './config.schema';
import { DbModule } from './lib/db/db.module';
import { EnvModule } from './lib/env/env.module';
import { EnvService } from './lib/env/env.service';
import { HashModule } from './lib/hash/hash.module';
import { ImageModule } from './lib/image/image.module';
import { MailModule } from './lib/mail/mail.module';
import { OrganizerModule } from './modules/organizer/organizer.module';
import { UsersModule } from './modules/users/users.module';
import { KhaltiModule } from './lib/khalti/khalti.module';
import { EsewaModule } from './lib/esewa/esewa.module';

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
    ConfigModule.forRoot({
      isGlobal: true,

      validate: (config) => configValidationSchema.parse(config),
    }),
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: EnvService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 1000,
          removeOnFail: 5000,
          attempts: 3,
        },
      }),
      inject: [ConfigService],
    }),

    DbModule,
    HashModule,
    MailModule,
    EnvModule,
    ImageModule,
    UsersModule,
    OrganizerModule,
    KhaltiModule,
    EsewaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
