import mongoose, { Schema, Document } from "mongoose";

export interface IAttendance extends Document {
  eventId: Schema.Types.ObjectId;
  memberId: Schema.Types.ObjectId;
  status: 'present' | 'absent' | 'late';
  markedBy: Schema.Types.ObjectId;
  date: Date;
}

const AttendanceSchema = new Schema<IAttendance>({
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  memberId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);