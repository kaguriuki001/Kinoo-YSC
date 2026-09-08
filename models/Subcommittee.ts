import mongoose, { Schema, Document } from "mongoose";

export interface ISubcommittee extends Document {
  name: string;
  chairUserId: Schema.Types.ObjectId;
  secretaryUserId: Schema.Types.ObjectId;
  members: Schema.Types.ObjectId[];
  whatsappGroupId?: string;
  whatsappInviteLink?: string;
  minutes: Schema.Types.ObjectId[];
  createdAt: Date;
}

const SubcommitteeSchema = new Schema<ISubcommittee>({
  name: { type: String, required: true },
  chairUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  secretaryUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  whatsappGroupId: String,
  whatsappInviteLink: String,
  minutes: [{ type: Schema.Types.ObjectId, ref: 'Minute' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Subcommittee || mongoose.model<ISubcommittee>("Subcommittee", SubcommitteeSchema);