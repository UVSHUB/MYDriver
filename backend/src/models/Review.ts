import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  bookingId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  rating: number;
  categories: {
    drivingSkill: number;
    safety: number;
    professionalism: number;
    punctuality: number;
  };
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    categories: {
      drivingSkill: { type: Number, min: 1, max: 5, default: 5 },
      safety: { type: Number, min: 1, max: 5, default: 5 },
      professionalism: { type: Number, min: 1, max: 5, default: 5 },
      punctuality: { type: Number, min: 1, max: 5, default: 5 },
    },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

ReviewSchema.index({ driverId: 1 });
ReviewSchema.index({ customerId: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
