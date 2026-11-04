import mongoose, { Schema, Document, Types } from 'mongoose';

export type SchemeType = 'BUY_X_GET_Y_FREE' | 'SLAB_PERCENT_DISCOUNT' | 'FLAT_CASH_DISCOUNT';

export interface IScheme extends Document {
  name: string;
  schemeType: SchemeType;
  primaryProductId: Types.ObjectId;
  buyQuantity: number;
  freeProductId?: Types.ObjectId;
  freeQuantity: number;
  minSlabQuantity: number;
  discountPercentage: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  combinable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SchemeSchema = new Schema<IScheme>(
  {
    name: { type: String, required: true, trim: true },
    schemeType: {
      type: String,
      enum: ['BUY_X_GET_Y_FREE', 'SLAB_PERCENT_DISCOUNT', 'FLAT_CASH_DISCOUNT'],
      required: true,
    },
    primaryProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    buyQuantity: { type: Number, default: 0 },
    freeProductId: { type: Schema.Types.ObjectId, ref: 'Product' },
    freeQuantity: { type: Number, default: 0 },
    minSlabQuantity: { type: Number, default: 0 },
    discountPercentage: { type: Number, default: 0 },
    startDate: { type: Date, default: Date.now, index: true },
    endDate: { type: Date, required: true, index: true },
    isActive: { type: Boolean, default: true },
    combinable: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Scheme = mongoose.model<IScheme>('Scheme', SchemeSchema);

