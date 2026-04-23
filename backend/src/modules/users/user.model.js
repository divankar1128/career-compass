import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    avatarUrl: String,
    role: { type: String, enum: ["user", "admin"], default: "user", index: true },
    plan: { type: String, enum: ["free", "pro", "team"], default: "free", index: true },
    stripeCustomerId: { type: String, index: true },
    onboarded: { type: Boolean, default: false },
    profile: {
      headline: String,
      bio: String,
      location: String,
      currentRole: String,
      experienceYears: Number,
      targetRole: String,
      skills: [String],
      goals: [String],
    },
    lastLoginAt: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
