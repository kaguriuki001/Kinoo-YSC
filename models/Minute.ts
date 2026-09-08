import mongoose, { Schema, Document } from "mongoose";

export interface IMinute extends Document {
  subcommitteeId: Schema.Types.ObjectId;
  content: string;
  uploadedBy: Schema.Types.ObjectId;
  date: Date;
  readOnly: boolean;
  version: number;
}

const MinuteSchema = new Schema<IMinute>({
  subcommitteeId: { type: Schema.Types.ObjectId, ref: 'Subcommittee', required: true },
  content: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  readOnly: { type: Boolean, default: true },
  version: { type: Number, default: 1 }
});

export default mongoose.models.Minute || mongoose.model<IMinute>("Minute", MinuteSchema);