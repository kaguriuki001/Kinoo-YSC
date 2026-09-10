import mongoose, { Schema, Document } from "mongoose";

export interface IBudgetItem {
  name: string;
  estimatedCost: number;
  actualCost: number;
}

export interface IBudget extends Document {
  title: string;
  eventId?: Schema.Types.ObjectId;
  items: IBudgetItem[];
  totalAmount: number;
  status: 'draft' | 'committeeReview' | 'approved' | 'rejected' | 'locked';
  createdBy?: Schema.Types.ObjectId;
  approvedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  title: { type: String, required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
  items: [{
    name: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 }
  }],
  totalAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'committeeReview', 'approved', 'rejected', 'locked'],
    default: 'draft'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
