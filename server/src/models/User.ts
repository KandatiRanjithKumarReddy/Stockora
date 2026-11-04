import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'RETAILER' | 'ORDER_DESK' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED';
export type AuthProvider = 'LOCAL' | 'GOOGLE' | 'HYBRID';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  googleId?: string;
  authProvider: AuthProvider;
  role: UserRole;
  status: UserStatus;
  retailerId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, sparse: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, sparse: true, unique: true },
    authProvider: { type: String, enum: ['LOCAL', 'GOOGLE', 'HYBRID'], default: 'LOCAL' },
    role: { type: String, enum: ['RETAILER', 'ORDER_DESK', 'ADMIN'], default: 'RETAILER' },
    status: { type: String, enum: ['ACTIVE', 'PENDING_APPROVAL', 'SUSPENDED'], default: 'ACTIVE' },
    retailerId: { type: Schema.Types.ObjectId, ref: 'Retailer' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);

