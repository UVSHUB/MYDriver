import mongoose, { Document, Schema } from 'mongoose';

export interface IEmergencyContact extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  relationship: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

EmergencyContactSchema.index({ userId: 1 });

export const EmergencyContact = mongoose.model<IEmergencyContact>('EmergencyContact', EmergencyContactSchema);
