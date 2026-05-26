import crypto from 'crypto';
import { ApiError, asyncHandler, getPagination, send } from '../utils/api.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Property } from '../models/Property.js';
import { createInvoiceNumber } from '../utils/invoice.js';
import { emitBookingUpdate, notifyUser } from '../services/notification.service.js';

export const createPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.body.booking).populate('property customer agent');
  if (!booking) throw new ApiError(404, 'Booking not found');
  if (booking.customer._id.toString() !== req.user._id.toString()) throw new ApiError(403, 'Only the customer can pay');
  if (booking.status !== 'payment_pending') throw new ApiError(400, 'Booking is not ready for payment');
  const holdingFee = Math.max(Math.round(booking.property.price * 0.01), 500);
  const payment = await Payment.create({
    booking: booking._id,
    customer: booking.customer._id,
    agent: booking.agent._id,
    property: booking.property._id,
    amount: req.body.amount || holdingFee,
    method: req.body.method,
    status: 'paid',
    transactionId: `TXN-${crypto.randomUUID()}`,
    invoiceNumber: createInvoiceNumber(),
    invoice: {
      customerName: booking.customer.name,
      propertyTitle: booking.property.title,
      issuedAt: new Date(),
      lineItems: [{ label: 'Booking holding fee', amount: req.body.amount || holdingFee }]
    }
  });
  booking.status = 'confirmed';
  booking.paidAt = new Date();
  booking.confirmedAt = new Date();
  await booking.save();
  if (booking.type === 'rent_request') await Property.findByIdAndUpdate(booking.property._id, { status: 'rented' });
  if (booking.type === 'buy_request') await Property.findByIdAndUpdate(booking.property._id, { status: 'sold' });
  await notifyUser({ user: booking.agent._id, title: 'Payment received', message: `${booking.customer.name} completed payment`, type: 'payment', metadata: { payment: payment._id } });
  emitBookingUpdate(booking);
  send(res, 201, 'Payment simulated successfully', { payment, booking });
});

export const listPayments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.user.role === 'customer') filter.customer = req.user._id;
  if (req.user.role === 'agent') filter.agent = req.user._id;
  const [items, total] = await Promise.all([
    Payment.find(filter).populate('booking property customer agent', 'title slug name email').sort('-createdAt').skip(skip).limit(limit),
    Payment.countDocuments(filter)
  ]);
  send(res, 200, 'Payments fetched', items, { page, limit, total, pages: Math.ceil(total / limit) });
});
