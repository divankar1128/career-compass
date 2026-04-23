import { Router } from "express";
import { User } from "../users/user.model.js";
import { Conversation } from "../chat/chat.model.js";
import { Resume } from "../resume/resume.model.js";
import { InterviewAnswer } from "../interview/interview.model.js";
import { authRequired, requireRole } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { cache } from "../../config/redis.js";

const router = Router();
router.use(authRequired, requireRole("admin"));

router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const cached = await cache.get("analytics:dashboard");
    if (cached) return res.json(cached);

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [signups, dau, conversions, conversations, resumes, mocks] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { lastLoginAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$lastLoginAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([{ $group: { _id: "$plan", count: { $sum: 1 } } }]),
      Conversation.countDocuments({ createdAt: { $gte: since } }),
      Resume.countDocuments({ createdAt: { $gte: since } }),
      InterviewAnswer.countDocuments({ createdAt: { $gte: since } }),
    ]);

    const out = { signups, dau, conversions, ai: { conversations, resumes, mocks } };
    await cache.set("analytics:dashboard", out, 60);
    res.json(out);
  }),
);

export default router;
