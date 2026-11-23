import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['company', 'driver', 'vehicleOwner', 'admin'],
      required: true,
      default: 'driver',
    },
    profileImage: {
      type: String,
      default: '',
    },
    accountStatus: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'blocked'],
      default: 'active',
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ role: 1, accountStatus: 1 });

export const User = mongoose.model('User', userSchema);
export default User;
