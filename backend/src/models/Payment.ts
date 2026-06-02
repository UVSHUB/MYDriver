import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: 'wallet' | 'card' | 'apple_pay' | 'google_pay' | 'payhere';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  payhereOrderId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'LKR' },
    method: {
      type: String,
      enum: ['wallet', 'card', 'apple_pay', 'google_pay', 'payhere'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionId: { type: String, default: null },
    payhereOrderId: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ bookingId: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
