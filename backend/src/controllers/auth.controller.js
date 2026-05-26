import { ApiError, asyncHandler, send } from '../utils/api.js';
import {
  cookieOptions,
  hashToken,
  signAccessToken,
  signEmailVerifyToken,
  signPasswordResetToken,
  signRefreshToken,
  verifyEmailToken,
  verifyPasswordResetToken,
  verifyRefreshToken
} from '../utils/tokens.js';
import { User } from '../models/User.js';
import { Wishlist } from '../models/Wishlist.js';
import { sendEmail } from '../services/email.service.js';
import { env } from '../config/env.js';

const setAuthCookies = async (res, user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user, user.tokenVersion || 0);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
  return { accessToken };
};

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  const user = await User.create({ name, email, password, phone, role });
  await Wishlist.create({ user: user._id, properties: [] });
  const verifyToken = signEmailVerifyToken(user);
  const verifyUrl = `${env.clientUrl}/verify-email?token=${verifyToken}`;
  await sendEmail({ to: user.email, subject: 'Verify your LuxeEstate account', html: `<p>Verify your account: <a href="${verifyUrl}">${verifyUrl}</a></p>` });
  const tokens = await setAuthCookies(res, user);
  send(res, 201, 'Account created', { user: user.safe(), ...tokens });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password +tokenVersion +refreshTokenHash');
  if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Your account has been disabled');
  user.lastLoginAt = new Date();
  const tokens = await setAuthCookies(res, user);
  send(res, 200, 'Logged in', { user: user.safe(), ...tokens });
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshTokenHash: 1 }, $inc: { tokenVersion: 1 } });
  }
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  send(res, 200, 'Logged out');
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken) throw new ApiError(401, 'Refresh token required');
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub).select('+tokenVersion +refreshTokenHash');
  if (!user || user.tokenVersion !== payload.tokenVersion || user.refreshTokenHash !== hashToken(refreshToken)) {
    throw new ApiError(401, 'Invalid refresh token');
  }
  const tokens = await setAuthCookies(res, user);
  send(res, 200, 'Token refreshed', { user: user.safe(), ...tokens });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    const token = signPasswordResetToken(user);
    const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;
    await sendEmail({ to: user.email, subject: 'Reset your LuxeEstate password', html: `<p>Reset password: <a href="${resetUrl}">${resetUrl}</a></p>` });
  }
  send(res, 200, 'If the email exists, reset instructions have been sent');
});

export const resetPassword = asyncHandler(async (req, res) => {
  const payload = verifyPasswordResetToken(req.body.token);
  const user = await User.findById(payload.sub).select('+tokenVersion');
  if (!user) throw new ApiError(404, 'User not found');
  user.password = req.body.password;
  user.tokenVersion += 1;
  await user.save();
  send(res, 200, 'Password reset successful');
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const payload = verifyEmailToken(req.body.token || req.query.token);
  const user = await User.findById(payload.sub);
  if (!user) throw new ApiError(404, 'User not found');
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  send(res, 200, 'Email verified', { user: user.safe() });
});

export const me = asyncHandler(async (req, res) => {
  send(res, 200, 'Current user', { user: req.user.safe() });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'address', 'avatar'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) req.user[key] = req.body[key];
  }
  await req.user.save();
  send(res, 200, 'Profile updated', { user: req.user.safe() });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password +tokenVersion');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is incorrect');
  user.password = req.body.newPassword;
  user.tokenVersion += 1;
  await user.save();
  send(res, 200, 'Password changed');
});
