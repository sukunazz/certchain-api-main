import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as path from 'path';
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
      envFilePath: path.resolve(process.cwd(), '.env'),
      validate: (config) => configValidationSchema.parse(config),
    }),
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 120,
      },
    ]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: EnvService) => {
        const redisUrl = configService.get('REDIS_URL');
        if (redisUrl) {
          // Parse Redis URL: redis://username:password@host:port/db?tls=true
          const url = new URL(redisUrl);
          const [username, password] =
            url.username && url.password
              ? [url.username, url.password]
              : ['default', url.password || ''];

          return {
            connection: {
              host: url.hostname || 'localhost',
              port: url.port ? parseInt(url.port) : 6379,
              username: username || 'default',
              password: password || undefined,
              ...((url.protocol === 'rediss:' ||
                url.searchParams.get('tls') === 'true') && { tls: {} }),
            },
            defaultJobOptions: {
              removeOnComplete: 1000,
              removeOnFail: 5000,
              attempts: 3,
            },
          };
        }
        return {
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
            password: configService.get('REDIS_PASSWORD'),
            ...(configService.get('REDIS_TLS') && { tls: {} }),
          },
          defaultJobOptions: {
            removeOnComplete: 1000,
            removeOnFail: 5000,
            attempts: 3,
          },
        };
      },
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
