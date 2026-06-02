import mongoose, { Document, Schema } from 'mongoose';

export type BookingStatus =
  | 'pending'
  | 'searching'
  | 'matched'
  | 'driver_arrived'
  | 'trip_started'
  | 'completed'
  | 'cancelled';

export type ServiceType = 'drive_me_home' | 'hire_driver' | 'emergency' | 'airport';

export interface ILocation {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  placeId?: string;
}

export interface IBooking extends Document {
  customerId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  serviceType: ServiceType;
  status: BookingStatus;
  pickupLocation: ILocation;
  dropLocation: ILocation;
  estimatedDistance: number; // km
  estimatedDuration: number; // minutes
  driverFee: number;
  platformFee: number;
  totalCost: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  cancellationReason?: string;
  startedAt?: Date;
  completedAt?: Date;
  actualDistance?: number;
  actualDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    placeId: String,
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', default: null },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    serviceType: {
      type: String,
      enum: ['drive_me_home', 'hire_driver', 'emergency', 'airport'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'searching', 'matched', 'driver_arrived', 'trip_started', 'completed', 'cancelled'],
      default: 'pending',
    },
    pickupLocation: { type: LocationSchema, required: true },
    dropLocation: { type: LocationSchema, required: true },
    estimatedDistance: { type: Number, required: true },
    estimatedDuration: { type: Number, required: true },
    driverFee: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    paymentMethod: { type: String, default: 'wallet' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'pending' },
    cancellationReason: String,
    startedAt: Date,
    completedAt: Date,
    actualDistance: Number,
    actualDuration: Number,
  },
  { timestamps: true }
);

BookingSchema.index({ customerId: 1, createdAt: -1 });
BookingSchema.index({ driverId: 1, status: 1 });
BookingSchema.index({ status: 1 });

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
