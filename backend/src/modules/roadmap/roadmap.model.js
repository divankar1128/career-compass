import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  week: Number,
  title: String,
  description: String,
  category: { type: String, enum: ["skill", "project", "networking", "interview", "other"], default: "skill" },
  resources: [{ title: String, url: String }],
  done: { type: Boolean, default: false },
  doneAt: Date,
});

const roadmapSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    targetRole: String,
    horizonWeeks: { type: Number, default: 12 },
    items: [itemSchema],
    progress: { type: Number, default: 0 }, // 0..1
  },
  { timestamps: true },
);

export const Roadmap = mongoose.model("Roadmap", roadmapSchema);
