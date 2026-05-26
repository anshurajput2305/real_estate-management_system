import { ApiError, asyncHandler, send } from '../utils/api.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Property } from '../models/Property.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';
import { notifyUser } from '../services/notification.service.js';

export const analytics = asyncHandler(async (_req, res) => {
  const [users, agents, activeListings, bookings, revenue, reports] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'agent' }),
    Property.countDocuments({ status: 'active' }),
    Booking.countDocuments(),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    Report.countDocuments({ status: { $in: ['open', 'reviewing'] } })
  ]);
  send(res, 200, 'Platform analytics fetched', { users, agents, activeListings, bookings, revenue: revenue[0]?.total || 0, paymentCount: revenue[0]?.count || 0, openReports: reports });
});

export const approveAgent = asyncHandler(async (req, res) => {
  const profile = await AgentProfile.findByIdAndUpdate(req.params.id, { verificationStatus: req.body.status || 'approved' }, { new: true });
  if (!profile) throw new ApiError(404, 'Agent profile not found');
  await notifyUser({ user: profile.user, title: 'Agent verification updated', message: `Your verification is ${profile.verificationStatus}`, type: 'system' });
  send(res, 200, 'Agent verification updated', profile);
});

export const listAgentProfiles = asyncHandler(async (_req, res) => {
  const profiles = await AgentProfile.find().populate('user', 'name email phone isActive').sort('-createdAt');
  send(res, 200, 'Agent profiles fetched', profiles);
});

export const moderateListing = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!property) throw new ApiError(404, 'Property not found');
  await notifyUser({ user: property.agent, title: 'Listing moderated', message: `${property.title} is now ${property.status}`, type: 'listing', metadata: { property: property._id } });
  send(res, 200, 'Listing moderated', property);
});

export const listReports = asyncHandler(async (_req, res) => {
  const reports = await Report.find().populate('reporter', 'name email role').sort('-createdAt');
  send(res, 200, 'Reports fetched', reports);
});

export const updateReport = asyncHandler(async (req, res) => {
  const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!report) throw new ApiError(404, 'Report not found');
  send(res, 200, 'Report updated', report);
});

export const announcement = asyncHandler(async (req, res) => {
  const users = await User.find(req.body.role ? { role: req.body.role } : {}).select('_id');
  await Promise.all(users.map((user) => notifyUser({ user: user._id, title: req.body.title, message: req.body.message, type: 'system' })));
  send(res, 201, 'Announcement sent', { recipients: users.length });
});
