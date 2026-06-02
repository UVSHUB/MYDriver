import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle {
  _id?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  brand: string;
  model: string;
  year?: number;
  registrationNumber: string;
  color: string;
  type: 'sedan' | 'suv' | 'van' | 'truck' | 'luxury' | 'other';
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
    registrationNumber: { type: String, required: true, trim: true, uppercase: true },
    color: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['sedan', 'suv', 'van', 'truck', 'luxury', 'other'],
      default: 'sedan',
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

VehicleSchema.index({ userId: 1 });

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
