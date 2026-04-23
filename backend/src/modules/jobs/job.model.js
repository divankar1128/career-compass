import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: "text" },
    company: { type: String, required: true, index: true },
    location: String,
    remote: { type: Boolean, default: false, index: true },
    level: { type: String, enum: ["intern", "junior", "mid", "senior", "lead"], index: true },
    salaryMin: Number,
    salaryMax: Number,
    currency: { type: String, default: "USD" },
    tags: { type: [String], index: true },
    description: String,
    applyUrl: String,
    postedAt: { type: Date, default: Date.now, index: true },
    source: String,
  },
  { timestamps: true },
);

export const Job = mongoose.model("Job", jobSchema);
