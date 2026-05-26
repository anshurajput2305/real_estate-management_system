import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ['card', 'upi', 'wallet'], required: true },
    status: { type: String, enum: ['initiated', 'paid', 'failed', 'refunded'], default: 'paid', index: true },
    transactionId: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    invoice: {
      customerName: String,
      propertyTitle: String,
      issuedAt: Date,
      lineItems: [{ label: String, amount: Number }]
    }
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
