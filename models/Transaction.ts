import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  fromUser?: Schema.Types.ObjectId;
  toAccount?: string;
  amount: number;
  purpose: string;
  type: 'income' | 'expense';
  description?: string;
  mpesaReceipt?: string;
  checkoutRequestID?: string;
  verified: boolean;
  date: Date;
  eventId?: Schema.Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  fromUser: { type: Schema.Types.ObjectId, ref: 'User' },
  toAccount: { type: String, default: 'Kinoo YSC Main' },
  amount: { type: Number, required: true },
  purpose: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], default: 'income' },
  description: String,
  mpesaReceipt: String,
  checkoutRequestID: String,
  verified: { type: Boolean, default: true },
  date: { type: Date, default: Date.now },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' }
});

TransactionSchema.index({ fromUser: 1, date: -1 });
TransactionSchema.index({ verified: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);