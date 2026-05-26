import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true, index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1200 },
    status: { type: String, enum: ['published', 'hidden'], default: 'published', index: true }
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, property: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
