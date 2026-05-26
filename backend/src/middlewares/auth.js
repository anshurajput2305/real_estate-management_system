import { ApiError, asyncHandler } from '../utils/api.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { User } from '../models/User.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = bearer || req.cookies.accessToken;
  if (!token) throw new ApiError(401, 'Authentication required');

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'Account is inactive or no longer exists');

  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null;
  const token = bearer || req.cookies.accessToken;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);
    if (user?.isActive) req.user = user;
  } catch {
    req.user = undefined;
  }
  return next();
});

export const allowRoles = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have permission to perform this action'));
  return next();
};
