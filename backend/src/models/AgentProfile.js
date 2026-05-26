import mongoose from 'mongoose';

const agentProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    agencyName: { type: String, trim: true, maxlength: 120 },
    licenseNumber: { type: String, trim: true, required: true },
    bio: { type: String, trim: true, maxlength: 2000 },
    yearsExperience: { type: Number, min: 0, default: 0 },
    serviceAreas: [{ type: String, trim: true }],
    specializations: [{ type: String, enum: ['rentals', 'sales', 'luxury', 'commercial', 'residential'] }],
    verificationStatus: { type: String, enum: ['draft', 'pending', 'approved', 'rejected'], default: 'pending', index: true },
    documents: [{ name: String, url: String, publicId: String }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const AgentProfile = mongoose.model('AgentProfile', agentProfileSchema);
