import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    action: { type: String, required: true, index: true },
    method: String,
    path: String,
    ip: String,
    statusCode: Number,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
