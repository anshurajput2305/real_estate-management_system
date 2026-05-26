import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['booking', 'payment', 'chat', 'listing', 'system'], default: 'system', index: true },
    read: { type: Boolean, default: false, index: true },
    link: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
