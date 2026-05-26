import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    targetType: { type: String, enum: ['property', 'user', 'agent', 'review'], required: true, index: true },
    target: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    reason: { type: String, required: true, trim: true },
    details: { type: String, trim: true, maxlength: 1500 },
    status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open', index: true },
    resolution: String
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
