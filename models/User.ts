import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  phone: string;
  passwordHash: string;
  fullName: string;
  photo?: string;
  idNumber?: string;
  roles: string[];
  status: 'active' | 'pending' | 'dismissed';
  twoFactorEnabled: boolean;
  whatsappRegistered: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true },
  photo: String,
  idNumber: String,
  roles: { type: [String], default: ['member'] },
  status: { type: String, default: 'pending', enum: ['active', 'pending', 'dismissed'] },
  twoFactorEnabled: { type: Boolean, default: false },
  whatsappRegistered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);