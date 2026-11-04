import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'READ' | 'RESPONDED';
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['NEW', 'READ', 'RESPONDED'], default: 'NEW', index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);

