import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  eventId: Schema.Types.ObjectId;
  items: { name: string; estimatedCost: number; actualCost: number }[];
  status: 'draft' | 'committeeReview' | 'approved' | 'locked';
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
}

const BudgetSchema = new Schema<IBudget>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  items: [{
    name: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
    actualCost: { type: Number, default: 0 }
  }],
  status: { type: String, enum: ['draft', 'committeeReview', 'approved', 'locked'], default: 'draft' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);