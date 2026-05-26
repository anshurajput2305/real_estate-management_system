import { ApiError, asyncHandler, getPagination, send } from '../utils/api.js';
import { Booking } from '../models/Booking.js';
import { Property } from '../models/Property.js';
import { emitBookingUpdate, notifyUser } from '../services/notification.service.js';

export const createBooking = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.body.property);
  if (!property || property.status !== 'active') throw new ApiError(404, 'Active property not found');
  const booking = await Booking.create({ ...req.body, customer: req.user._id, agent: property.agent });
  await notifyUser({ user: property.agent, title: 'New booking request', message: `${req.user.name} requested ${booking.type.replace('_', ' ')}`, type: 'booking', metadata: { booking: booking._id } });
  emitBookingUpdate(booking);
  send(res, 201, 'Booking submitted', booking);
});

export const listBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.user.role === 'customer') filter.customer = req.user._id;
  if (req.user.role === 'agent') filter.agent = req.user._id;
  if (req.query.status) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Booking.find(filter).populate('customer agent', 'name email phone avatar').populate('property', 'title slug price images address city').sort('-createdAt').skip(skip).limit(limit),
    Booking.countDocuments(filter)
  ]);
  send(res, 200, 'Bookings fetched', items, { page, limit, total, pages: Math.ceil(total / limit) });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('customer agent', 'name email phone avatar').populate('property');
  if (!booking) throw new ApiError(404, 'Booking not found');
  const participant = [booking.customer._id, booking.agent._id].some((id) => id.toString() === req.user._id.toString());
  if (req.user.role !== 'admin' && !participant) throw new ApiError(403, 'Not allowed');
  send(res, 200, 'Booking fetched', booking);
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (req.user.role === 'agent' && booking.agent.toString() !== req.user._id.toString()) throw new ApiError(403, 'Not allowed');
  if (!['approved', 'rejected', 'cancelled'].includes(req.body.status)) throw new ApiError(400, 'Invalid booking status transition');
  booking.status = req.body.status === 'approved' ? 'payment_pending' : req.body.status;
  if (req.body.status === 'approved') booking.approvedAt = new Date();
  if (req.body.status === 'rejected') booking.rejectionReason = req.body.rejectionReason || 'Request rejected';
  await booking.save();
  await notifyUser({ user: booking.customer, title: 'Booking updated', message: `Your booking is ${booking.status}`, type: 'booking', metadata: { booking: booking._id } });
  emitBookingUpdate(booking);
  send(res, 200, 'Booking updated', booking);
});
