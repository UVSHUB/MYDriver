import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'customer' | 'driver' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  otp?: string;
  otpExpiry?: Date;
  walletBalance: number;
  pushToken?: string;
  language: string;
  darkMode: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['customer', 'driver', 'admin'], default: 'customer' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    walletBalance: { type: Number, default: 0, min: 0 },
    pushToken: { type: String, default: null },
    language: { type: String, default: 'en' },
    darkMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
