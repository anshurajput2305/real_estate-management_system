import { ApiError, asyncHandler, getPagination, send } from '../utils/api.js';
import { User } from '../models/User.js';
import { Report } from '../models/Report.js';

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.q) filter.$text = { $search: req.query.q };
  const [items, total] = await Promise.all([User.find(filter).sort('-createdAt').skip(skip).limit(limit), User.countDocuments(filter)]);
  send(res, 200, 'Users fetched', items, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'You cannot disable your own account');
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  send(res, 200, 'User status updated', user);
});

export const createReport = asyncHandler(async (req, res) => {
  const report = await Report.create({ ...req.body, reporter: req.user._id });
  send(res, 201, 'Report submitted', report);
});
