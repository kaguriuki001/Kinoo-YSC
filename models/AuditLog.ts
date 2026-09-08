import mongoose, { Schema, Document } from "mongoose";
import { createHash } from "crypto";

export interface IAuditLog extends Document {
  performedBy: Schema.Types.ObjectId;
  action: string;
  targetUser?: Schema.Types.ObjectId;
  reason?: string;
  hash: string;
  previousHash: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  hash: { type: String, required: true },
  previousHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Add method to create hash chain
AuditLogSchema.statics.createHashChain = async function(
  performedBy: string,
  action: string,
  targetUser?: string,
  reason?: string
) {
  const lastEntry = await this.findOne().sort({ timestamp: -1 });
  const previousHash = lastEntry ? lastEntry.hash : '0';
  const data = JSON.stringify({ performedBy, action, targetUser, reason, timestamp: new Date() });
  const hash = createHash('sha256').update(previousHash + data).digest('hex');
  
  return await this.create({
    performedBy,
    action,
    targetUser,
    reason,
    hash,
    previousHash,
    timestamp: new Date()
  });
};

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);