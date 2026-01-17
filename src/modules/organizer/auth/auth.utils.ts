import { Response } from 'express';
import { Tokens } from './auth.interface';

export const setTokenCookie = (res: Response, tokens: Tokens) => {
  res.cookie(
    process.env.ORGANIZER_ACCESS_TOKEN_COOKIE_NAME,
    tokens.accessToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  );
  res.cookie(
    process.env.ORGANIZER_REFRESH_TOKEN_COOKIE_NAME,
    tokens.refreshToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    },
  );
};

export const clearTokenCookie = (res: Response) => {
  res.clearCookie(process.env.ORGANIZER_ACCESS_TOKEN_COOKIE_NAME);
  res.clearCookie(process.env.ORGANIZER_REFRESH_TOKEN_COOKIE_NAME);
};
