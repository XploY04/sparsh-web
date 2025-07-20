import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "trial_created",
        "trial_updated",
        "trial_unblinded",
        "participant_enrolled",
        "participant_unblinded",
        "participant_withdrawn",
        "data_export",
        "admin_login",
        "user_created",
        "user_updated",
      ],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    ipAddress: String,
    userAgent: String,
    trialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trial",
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ trialId: 1, timestamp: -1 });

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", AuditLogSchema);
