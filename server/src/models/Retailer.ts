import mongoose, { Schema, Document } from 'mongoose';

export type CreditStatus = 'GOOD' | 'WATCH' | 'BLOCKED';

export interface IRetailer extends Document {
  storeName: string;
  ownerName: string;
  phone: string;
  address: {
    street: string;
    locality: string;
    city: string;
    pincode: string;
    state: string;
  };
  gstin?: string;
  creditLimit: number;
  outstandingBalance: number;
  creditStatus: CreditStatus;
  priceTier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RetailerSchema = new Schema<IRetailer>(
  {
    storeName: { type: String, required: true, trim: true, index: true },
    ownerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String, default: '' },
      locality: { type: String, required: true },
      city: { type: String, default: 'Jabalpur' },
      pincode: { type: String, default: '482001' },
      state: { type: String, default: 'Madhya Pradesh' },
    },
    gstin: { type: String, sparse: true, uppercase: true, trim: true },
    creditLimit: { type: Number, default: 50000 },
    outstandingBalance: { type: Number, default: 0 },
    creditStatus: { type: String, enum: ['GOOD', 'WATCH', 'BLOCKED'], default: 'GOOD' },
    priceTier: { type: String, default: 'DEFAULT' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Retailer = mongoose.model<IRetailer>('Retailer', RetailerSchema);

