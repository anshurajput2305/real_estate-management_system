import { ApiError, asyncHandler, send } from '../utils/api.js';
import { AgentProfile } from '../models/AgentProfile.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Property } from '../models/Property.js';

export const upsertAgentProfile = asyncHandler(async (req, res) => {
  if (req.user.role !== 'agent') throw new ApiError(403, 'Only agents can create agent profiles');
  const profile = await AgentProfile.findOneAndUpdate(
    { user: req.user._id },
    { ...req.body, user: req.user._id, verificationStatus: req.body.verificationStatus || 'pending' },
    { upsert: true, new: true, runValidators: true }
  );
  send(res, 200, 'Agent profile saved', profile);
});

export const getMyAgentProfile = asyncHandler(async (req, res) => {
  const profile = await AgentProfile.findOne({ user: req.user._id });
  send(res, 200, 'Agent profile fetched', profile);
});

export const agentAnalytics = asyncHandler(async (req, res) => {
  const [properties, bookings, payments] = await Promise.all([
    Property.countDocuments({ agent: req.user._id }),
    Booking.aggregate([{ $match: { agent: req.user._id } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.aggregate([{ $match: { agent: req.user._id, status: 'paid' } }, { $group: { _id: null, revenue: { $sum: '$amount' }, count: { $sum: 1 } } }])
  ]);
  send(res, 200, 'Agent analytics fetched', { properties, bookings, revenue: payments[0]?.revenue || 0, payments: payments[0]?.count || 0 });
});
