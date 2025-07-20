import mongoose from "mongoose";

const ArmSchema = new mongoose.Schema({
  name: String,
  description: String,
});

const TrialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: {
      type: String,
      enum: ["draft", "active", "completed", "paused"],
      default: "draft",
    },
    arms: [ArmSchema],
    randomizationRatio: {
      type: [Number],
      default: [1, 1], // Default 1:1 ratio
    },
    targetEnrollment: {
      type: Number,
      default: 100,
    },
    isUnblinded: {
      type: Boolean,
      default: false,
    },
    unblindedAt: {
      type: Date,
    },
    unblindedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Trial || mongoose.model("Trial", TrialSchema);
