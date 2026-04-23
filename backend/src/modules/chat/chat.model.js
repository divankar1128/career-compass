import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["system", "user", "assistant"], required: true },
    content: { type: String, required: true },
    tokens: Number,
  },
  { timestamps: true },
);

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    title: { type: String, default: "New conversation" },
    messages: [messageSchema],
  },
  { timestamps: true },
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
