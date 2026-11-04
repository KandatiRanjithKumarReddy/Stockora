import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IRetailerAlias extends Document {
  retailerId: Types.ObjectId;
  rawKeyword: string;
  mappedProductId: Types.ObjectId;
  mappedSku: string;
  preferredUnit: 'CASE' | 'PIECE';
  confidenceScore: number;
  createdFrom: 'ORDER_DESK_CORRECTION' | 'RETAILER_CONFIRMATION';
  createdAt: Date;
  updatedAt: Date;
}

const RetailerAliasSchema = new Schema<IRetailerAlias>(
  {
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    rawKeyword: { type: String, required: true, lowercase: true, trim: true, index: true },
    mappedProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    mappedSku: { type: String, required: true },
    preferredUnit: { type: String, enum: ['CASE', 'PIECE'], default: 'CASE' },
    confidenceScore: { type: Number, default: 1.0 },
    createdFrom: {
      type: String,
      enum: ['ORDER_DESK_CORRECTION', 'RETAILER_CONFIRMATION'],
      default: 'ORDER_DESK_CORRECTION',
    },
  },
  { timestamps: true }
);

RetailerAliasSchema.index({ retailerId: 1, rawKeyword: 1 }, { unique: true });

export const RetailerAlias = mongoose.model<IRetailerAlias>('RetailerAlias', RetailerAliasSchema);

