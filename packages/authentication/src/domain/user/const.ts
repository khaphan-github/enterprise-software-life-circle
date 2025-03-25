import { Options } from 'argon2';

export const PASSWORD_HASH_OPTIONS: Options = {
  hashLength: 32,
  timeCost: 3,
  memoryCost: 4096,
  parallelism: 1,
  secret: Buffer.from(process.env.AUTHENTICATION_SECRET_KEY || 'FF'),
  salt: Buffer.from(
    process.env.AUTHENTICATION_SALT || 'UvlBU1rGGTSU47TWBGintKlSH4uKKxk8',
  ),
};

export const ACCESS_TOKEN_SECRET_KEY =
  process.env.AUTHENTICATION_ACCESS_TOKEN_SECRET_KEY;
export const REFRESH_TOKEN_SECRET_KEY =
  process.env.AUTHENTICATION_REFRESH_TOKEN_SECRET_KEY;
export const ACCESS_TOKEN_EXPIRES_IN =
  process.env.AUTHENTICATION_ACCESS_TOKEN_EXPIRES_IN || '1h';
export const REFRESH_TOKEN_EXPIRES_IN =
  process.env.AUTHENTICATION_REFRESH_TOKEN_EXPIRES_IN || '7d';
