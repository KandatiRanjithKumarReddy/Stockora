import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRetailerPrice extends Document {
  retailerId: Types.ObjectId;
  productId: Types.ObjectId;
  customDealerPricePerPack: number;
  validFrom: Date;
  validTo?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RetailerPriceSchema = new Schema<IRetailerPrice>(
  {
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    customDealerPricePerPack: { type: Number, required: true, min: 0 },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
  },
  { timestamps: true }
);

RetailerPriceSchema.index({ retailerId: 1, productId: 1 }, { unique: true });

export const RetailerPrice = mongoose.model<IRetailerPrice>('RetailerPrice', RetailerPriceSchema);

