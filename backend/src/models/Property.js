import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    price: { type: Number, required: true, min: 0, index: true },
    listingType: { type: String, enum: ['rent', 'sale'], required: true, index: true },
    category: { type: String, enum: ['apartment', 'villa', 'house', 'condo', 'studio', 'commercial', 'land'], required: true, index: true },
    bedrooms: { type: Number, min: 0, default: 0, index: true },
    bathrooms: { type: Number, min: 0, default: 0 },
    squareFeet: { type: Number, min: 1, required: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    state: { type: String, required: true, trim: true, index: true },
    zipCode: { type: String, trim: true },
    coordinates: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    amenities: [{ type: String, trim: true }],
    nearbyPlaces: [{ name: String, distance: String, category: String }],
    images: [{ url: String, publicId: String, caption: String }],
    videoTour: { url: String, publicId: String },
    documents: [{ name: String, url: String, publicId: String }],
    featured: { type: Boolean, default: false, index: true },
    verified: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['draft', 'pending', 'active', 'sold', 'rented', 'rejected', 'archived'], default: 'pending', index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviews: { type: Number, default: 0 }
  },
  { timestamps: true }
);

propertySchema.index({ coordinates: '2dsphere' });
propertySchema.index({ title: 'text', description: 'text', city: 'text', state: 'text', amenities: 'text' });

export const Property = mongoose.model('Property', propertySchema);
