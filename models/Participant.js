import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema(
  {
    participantCode: {
      type: String,
      required: true,
      unique: true,
    },
    trialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trial",
      required: true,
    },
    status: {
      type: String,
      enum: ["enrolled", "active", "completed", "withdrawn"],
      default: "enrolled",
    },
    assignedGroup: {
      type: Number,
      required: true,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    isUnblinded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
ParticipantSchema.index({ trialId: 1, enrollmentDate: -1 });

export default mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);
