import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
  userId?: Types.ObjectId;
  role?: string;
  category: 'GENERAL' | 'BUG' | 'ORDER_ISSUE' | 'AI_ACCURACY' | 'FEATURE_REQUEST';
  message: string;
  pageUrl?: string;
  browserInfo?: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, default: 'ANONYMOUS' },
    category: {
      type: String,
      enum: ['GENERAL', 'BUG', 'ORDER_ISSUE', 'AI_ACCURACY', 'FEATURE_REQUEST'],
      default: 'GENERAL',
    },
    message: { type: String, required: true },
    pageUrl: { type: String },
    browserInfo: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);

