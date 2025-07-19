import mongoose from "mongoose";

const DataPointSchema = new mongoose.Schema(
  {
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    trialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trial",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        "SymptomReport",
        "VitalSigns",
        "MedicationIntake",
        "EmergencyCall",
        "SideEffect",
        "QualityOfLife",
        "AppUsage",
        "Other",
      ],
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isAlert: {
      type: Boolean,
      default: false,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
DataPointSchema.index({ participantId: 1, timestamp: -1 });
DataPointSchema.index({ trialId: 1, timestamp: -1 });
DataPointSchema.index({ trialId: 1, isAlert: 1, timestamp: -1 });
DataPointSchema.index({ type: 1, timestamp: -1 });

export default mongoose.models.DataPoint ||
  mongoose.model("DataPoint", DataPointSchema);
