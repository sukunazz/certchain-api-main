import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { EnvService } from 'src/lib/env/env.service';
import { Tokens } from './auth.interface';

const config = new EnvService(new ConfigService());

export const setTokenCookie = (res: Response, tokens: Tokens) => {
  // Set access token cookie
  res.cookie(config.get('USER_ACCESS_TOKEN_COOKIE_NAME'), tokens.accessToken, {
    httpOnly: true,
    secure: config.get('NODE_ENV') === 'production',
    sameSite: 'lax',
    domain: config.get('USER_COOKIE_DOMAIN'),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set refresh token cookie
  res.cookie(
    config.get('USER_REFRESH_TOKEN_COOKIE_NAME'),
    tokens.refreshToken,
    {
      httpOnly: true,
      secure: config.get('NODE_ENV') === 'production',
      sameSite: 'lax',
      domain: config.get('USER_COOKIE_DOMAIN'),
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  );
};

export const clearTokenCookie = (res: Response) => {
  res.clearCookie(config.get('USER_ACCESS_TOKEN_COOKIE_NAME'), {
    domain: config.get('USER_COOKIE_DOMAIN'),
  });
  res.clearCookie(config.get('USER_REFRESH_TOKEN_COOKIE_NAME'), {
    domain: config.get('USER_COOKIE_DOMAIN'),
  });
};
