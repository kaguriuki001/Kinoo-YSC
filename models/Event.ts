import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  date: Date;
  ticketPrice: number;
  priceSetDate: Date;
  venue: string;
  description?: string;
  organizerId: Schema.Types.ObjectId;
  budgetId?: Schema.Types.ObjectId;
  transportPlan?: any;
  cateringPlan?: any;
  equipmentNeeds?: string[];
  attendanceListPDF?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  ticketPrice: { type: Number, default: 0 },
  priceSetDate: { type: Date },
  venue: { type: String, required: true },
  description: String,
  organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  budgetId: { type: Schema.Types.ObjectId, ref: 'Budget' },
  transportPlan: Schema.Types.Mixed,
  cateringPlan: Schema.Types.Mixed,
  equipmentNeeds: [String],
  attendanceListPDF: String,
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);