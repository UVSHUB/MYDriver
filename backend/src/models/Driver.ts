import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  licenseNumber: string;
  experience: number; // years
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  isOnTrip: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    heading?: number;
    speed?: number;
    updatedAt: Date;
  };
  vehicleClasses: string[];
  documents: {
    license?: string;
    insurance?: string;
    backgroundCheck?: string;
  };
  totalTrips: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    licenseNumber: { type: String, required: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: false },
    isOnTrip: { type: Boolean, default: false },
    currentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
      heading: { type: Number },
      speed: { type: Number },
      updatedAt: { type: Date, default: Date.now },
    },
    vehicleClasses: { type: [String], default: ['sedan', 'suv', 'van'] },
    documents: {
      license: String,
      insurance: String,
      backgroundCheck: String,
    },
    totalTrips: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DriverSchema.index({ currentLocation: '2dsphere' });

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);
