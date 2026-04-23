import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    filename: String,
    path: String,
    sizeBytes: Number,
    text: String,
    status: { type: String, enum: ["queued", "processing", "ready", "failed"], default: "queued", index: true },
    score: { type: Number, min: 0, max: 100 },
    breakdown: {
      content: Number,
      structure: Number,
      keywords: Number,
      impact: Number,
      formatting: Number,
    },
    strengths: [String],
    gaps: [String],
    suggestions: [String],
    error: String,
  },
  { timestamps: true },
);

export const Resume = mongoose.model("Resume", resumeSchema);
