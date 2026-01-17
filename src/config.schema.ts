import { z } from 'zod';

export const configValidationSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .default('postgres://postgres:postgres@localhost:5432/cc'),

  APP_URL: z.string().default('http://localhost:3001'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  MAIL_FROM: z.string().default('noreply@certchain.co'),
  MAIL_FROM_NAME: z.string().default('CertChain'),

  ADMIN_ACCESS_TOKEN_SECRET: z.string().default('secret'),
  ADMIN_REFRESH_TOKEN_SECRET: z.string().default('secret'),

  ADMIN_ACCESS_TOKEN_COOKIE_NAME: z.string().default('admin-access-token'),
  ADMIN_REFRESH_TOKEN_COOKIE_NAME: z.string().default('admin-refresh-token'),

  ORGANIZER_ACCESS_TOKEN_SECRET: z.string().default('secret'),
  ORGANIZER_REFRESH_TOKEN_SECRET: z.string().default('secret'),
  ORGANIZER_RESET_PASSWORD_TOKEN_SECRET: z.string().default('secret'),
  ORGANIZER_INVITATION_TOKEN_SECRET: z.string().default('secret'),
  ORGANIZER_RESET_PASSWORD_URL: z.string().default(''),
  ORGANIZER_VERIFICATION_TOKEN_SECRET: z.string().default(''),

  ORGANIZER_ACCESS_TOKEN_COOKIE_NAME: z
    .string()
    .default('organizer-access-token'),
  ORGANIZER_REFRESH_TOKEN_COOKIE_NAME: z
    .string()
    .default('organizer-refresh-token'),
  ORGANIZER_VERIFICATION_URL: z.string().default(''),

  USER_ACCESS_TOKEN_SECRET: z.string().default('user-access-token-secret'),
  USER_REFRESH_TOKEN_SECRET: z.string().default('user-refresh-token-secret'),
  USER_VERIFICATION_TOKEN_SECRET: z
    .string()
    .default('user-verification-token-secret'),
  USER_RESET_PASSWORD_TOKEN_SECRET: z
    .string()
    .default('user-reset-password-token-secret'),
  USER_ACCESS_TOKEN_COOKIE_NAME: z.string().default('user_access_token'),
  USER_REFRESH_TOKEN_COOKIE_NAME: z.string().default('user_refresh_token'),
  USER_VERIFICATION_URL: z.string().default('http://localhost:3000/verify/'),
  USER_RESET_PASSWORD_URL: z
    .string()
    .default('http://localhost:3000/reset-password/'),
  USER_COOKIE_DOMAIN: z.string().default('localhost'),

  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  JWT_INVITATION_TOKEN_EXPIRES_IN: z.string().default('7d'),
  JWT_RESET_PASSWORD_TOKEN_EXPIRES_IN: z.string().default('24h'),
  JWT_VERIFICATION_TOKEN_EXPIRES_IN: z.string().default('24h'),

  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  AUTH_GOOGLE_CALLBACK_URL: z.string(),
  AUTH_GOOGLE_REDIRECT_URL: z.string().optional(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),

  KHALTI_SECRET_KEY: z.string(),
});

export type ConfigSchema = z.infer<typeof configValidationSchema>;
