import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  type: { type: String, enum: ["behavioral", "technical", "system-design", "case"], index: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], index: true },
  prompt: String,
  rubric: [String],
});

const answerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: "InterviewQuestion", required: true },
    transcript: String,
    score: Number,
    breakdown: { content: Number, structure: Number, delivery: Number },
    feedback: String,
    suggestions: [String],
  },
  { timestamps: true },
);

export const InterviewQuestion = mongoose.model("InterviewQuestion", questionSchema);
export const InterviewAnswer = mongoose.model("InterviewAnswer", answerSchema);
