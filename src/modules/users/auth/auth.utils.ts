import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { EnvService } from 'src/lib/env/env.service';
import { Tokens } from './auth.interface';

const config = new EnvService(new ConfigService());

export const setTokenCookie = (res: Response, tokens: Tokens) => {
  const isProd = config.get('NODE_ENV') === 'production';
  const cookieDomain = config.get('USER_COOKIE_DOMAIN');
  const domain = cookieDomain && cookieDomain !== 'localhost' ? cookieDomain : undefined;
  const sameSite = isProd ? 'none' : 'lax';

  // Set access token cookie
  res.cookie(config.get('USER_ACCESS_TOKEN_COOKIE_NAME'), tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite,
    ...(domain ? { domain } : {}),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Set refresh token cookie
  res.cookie(
    config.get('USER_REFRESH_TOKEN_COOKIE_NAME'),
    tokens.refreshToken,
    {
      httpOnly: true,
      secure: isProd,
      sameSite,
      ...(domain ? { domain } : {}),
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  );
};

export const clearTokenCookie = (res: Response) => {
  const cookieDomain = config.get('USER_COOKIE_DOMAIN');
  const domain = cookieDomain && cookieDomain !== 'localhost' ? cookieDomain : undefined;

  res.clearCookie(config.get('USER_ACCESS_TOKEN_COOKIE_NAME'), {
    ...(domain ? { domain } : {}),
  });
  res.clearCookie(config.get('USER_REFRESH_TOKEN_COOKIE_NAME'), {
    ...(domain ? { domain } : {}),
  });
};
