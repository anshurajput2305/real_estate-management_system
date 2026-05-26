import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email address']
    },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['customer', 'agent', 'admin'], default: 'customer', index: true },
    avatar: {
      url: String,
      publicId: String
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    refreshTokenHash: { type: String, select: false },
    tokenVersion: { type: Number, default: 0, select: false },
    lastLoginAt: Date,
    address: {
      line1: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  { timestamps: true }
);

userSchema.index({ name: 'text', email: 'text' });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.safe = function safeUser() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokenHash;
  delete obj.tokenVersion;
  return obj;
};

export const User = mongoose.model('User', userSchema);
