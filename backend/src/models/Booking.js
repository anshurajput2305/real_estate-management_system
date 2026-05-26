import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    type: { type: String, enum: ['visit', 'rent_request', 'buy_request'], required: true, index: true },
    visitDate: Date,
    message: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'payment_pending', 'paid', 'confirmed', 'cancelled'],
      default: 'pending',
      index: true
    },
    rejectionReason: String,
    approvedAt: Date,
    paidAt: Date,
    confirmedAt: Date
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, property: 1, type: 1 });

export const Booking = mongoose.model('Booking', bookingSchema);
