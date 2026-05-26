import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtAccessSecret, { expiresIn: env.accessTokenExpires });

export const signRefreshToken = (user, tokenVersion) =>
  jwt.sign({ sub: user._id.toString(), tokenVersion }, env.jwtRefreshSecret, { expiresIn: env.refreshTokenExpires });

export const signPasswordResetToken = (user) =>
  jwt.sign({ sub: user._id.toString(), purpose: 'password-reset' }, env.jwtResetSecret, { expiresIn: '20m' });

export const signEmailVerifyToken = (user) =>
  jwt.sign({ sub: user._id.toString(), purpose: 'email-verify' }, env.jwtVerifySecret, { expiresIn: '24h' });

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);
export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);
export const verifyPasswordResetToken = (token) => jwt.verify(token, env.jwtResetSecret);
export const verifyEmailToken = (token) => jwt.verify(token, env.jwtVerifySecret);

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  domain: env.cookieDomain,
  path: '/'
};
