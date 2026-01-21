import { Response } from 'express';
import { Tokens } from './auth.interface';

export const setTokenCookie = (res: Response, tokens: Tokens) => {
  const isProd = process.env.NODE_ENV === 'production';
  const sameSite = isProd ? 'none' : 'lax';

  res.cookie(
    process.env.ORGANIZER_ACCESS_TOKEN_COOKIE_NAME,
    tokens.accessToken,
    {
      httpOnly: true,
      secure: isProd,
      sameSite,
    },
  );
  res.cookie(
    process.env.ORGANIZER_REFRESH_TOKEN_COOKIE_NAME,
    tokens.refreshToken,
    {
      httpOnly: true,
      secure: isProd,
      sameSite,
    },
  );
};

export const clearTokenCookie = (res: Response) => {
  res.clearCookie(process.env.ORGANIZER_ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(process.env.ORGANIZER_REFRESH_TOKEN_COOKIE_NAME);
};
