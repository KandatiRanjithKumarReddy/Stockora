import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  brand: string;
  category: string;
  packSize: string;
  hsnCode: string;
  unitsPerCase: number;
  caseWeightKg?: number;
  mrp: number;
  dealerPricePerPack: number;
  calculatedCasePrice: number;
  gstRatePercent: number;
  isGstIncluded: boolean;
  stockCasesAvailable: number;
  stockCasesReserved: number;
  lowStockThresholdCases: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true, index: true },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: String, required: true, trim: true, index: true },
    packSize: { type: String, required: true, trim: true },
    hsnCode: { type: String, required: true, trim: true, index: true },
    unitsPerCase: { type: Number, required: true, min: 1 },
    caseWeightKg: { type: Number },
    mrp: { type: Number, required: true, min: 0 },
    dealerPricePerPack: { type: Number, required: true, min: 0 },
    calculatedCasePrice: { type: Number, required: true, min: 0 },
    gstRatePercent: { type: Number, required: true, default: 5 },
    isGstIncluded: { type: Boolean, default: false },
    stockCasesAvailable: { type: Number, required: true, default: 0, min: 0 },
    stockCasesReserved: { type: Number, required: true, default: 0, min: 0 },
    lowStockThresholdCases: { type: Number, default: 20 },
    imageUrl: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

