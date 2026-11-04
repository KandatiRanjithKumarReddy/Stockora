import mongoose, { Schema, Document, Types } from 'mongoose';

export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'CREDIT_HOLD'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'SYNCED_TO_TALLY';

export type OrderSource = 'CATALOG' | 'AI_WHATSAPP_PARSE' | 'DESK_MANUAL';

export interface IOrderItem {
  productId: Types.ObjectId;
  sku: string;
  name: string;
  hsnCode: string;
  orderedCases: number;
  unitsPerCaseSnapshot: number;
  packPriceSnapshot: number;
  casePriceSnapshot: number;
  grossAmount: number;
  freeCases: number;
  appliedSchemeId?: Types.ObjectId;
  appliedSchemeName?: string;
  discountPercent: number;
  discountAmount: number;
  taxableAmount: number;
  gstRatePercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  netAmount: number;
}

export interface IStaffCorrection {
  field: string;
  originalValue: any;
  correctedValue: any;
  correctedBy: Types.ObjectId;
  timestamp: Date;
}

export interface IOrder extends Document {
  orderNumber: string;
  retailerId: Types.ObjectId;
  source: OrderSource;
  status: OrderStatus;
  rawTextOrder?: string;
  reservationExpiresAt: Date;
  items: IOrderItem[];
  subtotal: number;
  totalDiscount: number;
  totalCgst: number;
  totalSgst: number;
  totalTax: number;
  finalPayableAmount: number;
  creditCheck: {
    passed: boolean;
    currentBalanceSnapshot: number;
    creditLimitSnapshot: number;
    orderAmount: number;
    flaggedHold: boolean;
    reviewNote?: string;
  };
  tallyExport: {
    isExported: boolean;
    exportedAt?: Date;
    exportBatchId?: string;
  };
  staffCorrections: IStaffCorrection[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    hsnCode: { type: String, required: true },
    orderedCases: { type: Number, required: true, min: 1 },
    unitsPerCaseSnapshot: { type: Number, required: true },
    packPriceSnapshot: { type: Number, required: true },
    casePriceSnapshot: { type: Number, required: true },
    grossAmount: { type: Number, required: true },
    freeCases: { type: Number, default: 0 },
    appliedSchemeId: { type: Schema.Types.ObjectId, ref: 'Scheme' },
    appliedSchemeName: { type: String },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    taxableAmount: { type: Number, required: true },
    gstRatePercent: { type: Number, required: true },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer', required: true, index: true },
    source: {
      type: String,
      enum: ['CATALOG', 'AI_WHATSAPP_PARSE', 'DESK_MANUAL'],
      default: 'CATALOG',
    },
    status: {
      type: String,
      enum: [
        'PENDING_CONFIRMATION',
        'SUBMITTED',
        'UNDER_REVIEW',
        'CREDIT_HOLD',
        'APPROVED',
        'REJECTED',
        'EXPIRED',
        'SYNCED_TO_TALLY',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    rawTextOrder: { type: String },
    reservationExpiresAt: { type: Date, required: true, index: true },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    totalCgst: { type: Number, default: 0 },
    totalSgst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    finalPayableAmount: { type: Number, required: true },
    creditCheck: {
      passed: { type: Boolean, default: true },
      currentBalanceSnapshot: { type: Number, default: 0 },
      creditLimitSnapshot: { type: Number, default: 50000 },
      orderAmount: { type: Number, default: 0 },
      flaggedHold: { type: Boolean, default: false },
      reviewNote: { type: String },
    },
    tallyExport: {
      isExported: { type: Boolean, default: false, index: true },
      exportedAt: { type: Date },
      exportBatchId: { type: String },
    },
    staffCorrections: [
      {
        field: { type: String },
        originalValue: { type: Schema.Types.Mixed },
        correctedValue: { type: Schema.Types.Mixed },
        correctedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

