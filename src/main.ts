import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import { json } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './constants/interceptors/response/response.interceptor';
import { BadRequestException } from './lib/exceptions/bad-request.exception';
import { openApiConfig } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('NestApplication');
  const appUrl = configService.get<string>('APP_URL');
  const allowedOrigins = appUrl
    ? appUrl.split(',').map((origin) => origin.trim()).filter(Boolean)
    : true;

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins === true) {
        return callback(null, true);
      }
      const isAllowed = Array.isArray(allowedOrigins)
        ? allowedOrigins.includes(origin)
        : allowedOrigins === origin;
      return callback(null, isAllowed);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
      'Expires',
    ],
  });

  app.use(cookieParser());
  app.use(json({ limit: '50mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErros: ValidationError[] = []) => {
        // convert it to like zod
        const errors = {};
        const error = validationErros[0];
        if (error && error.constraints) {
          errors[error.property] = Object.values(error.constraints)[0];
        }

        logger.error(errors);
        logger.error(validationErros);

        return new BadRequestException('Validation failed', errors);
      },
    }),
  );

  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('/api', app, document);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new ResponseInterceptor(),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
