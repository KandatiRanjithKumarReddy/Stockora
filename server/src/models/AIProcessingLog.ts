import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAIProcessingLog extends Document {
  retailerId?: Types.ObjectId;
  rawInputText: string;
  selectedModel: string;
  attemptedModels: string[];
  fallbackTriggered: boolean;
  durationMs: number;
  status: 'SUCCESS' | 'PARTIAL_MATCH' | 'FALLBACK_EXHAUSTED' | 'ERROR';
  errorCategory?: string;
  matchedSkus: string[];
  unmatchedPhrases: string[];
  createdAt: Date;
}

const AIProcessingLogSchema = new Schema<IAIProcessingLog>(
  {
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer', index: true },
    rawInputText: { type: String, required: true },
    selectedModel: { type: String, required: true },
    attemptedModels: [{ type: String }],
    fallbackTriggered: { type: Boolean, default: false },
    durationMs: { type: Number, required: true },
    status: {
      type: String,
      enum: ['SUCCESS', 'PARTIAL_MATCH', 'FALLBACK_EXHAUSTED', 'ERROR'],
      required: true,
      index: true,
    },
    errorCategory: { type: String },
    matchedSkus: [{ type: String }],
    unmatchedPhrases: [{ type: String }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AIProcessingLog = mongoose.model<IAIProcessingLog>('AIProcessingLog', AIProcessingLogSchema);

