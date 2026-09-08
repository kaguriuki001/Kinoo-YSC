import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  fromUser: Schema.Types.ObjectId;
  toAccount: string;
  amount: number;
  purpose: string;
  mpesaReceipt?: string;
  checkoutRequestID?: string;
  verified: boolean;
  date: Date;
  eventId?: Schema.Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toAccount: { type: String, default: 'Kinoo YSC Main' },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  mpesaReceipt: String,
  checkoutRequestID: String,
  verified: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' }
});

// Index for faster queries
TransactionSchema.index({ fromUser: 1, date: -1 });
TransactionSchema.index({ verified: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);