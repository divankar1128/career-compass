import { Router } from "express";
import { Roadmap } from "./roadmap.model.js";
import { User } from "../users/user.model.js";
import { authRequired } from "../../middleware/auth.js";
import { aiLimiter } from "../../middleware/rateLimit.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { openai, OPENAI_MODEL } from "../../config/openai.js";

const router = Router();
router.use(authRequired);

const SYSTEM = `You are a career roadmap planner. Given a user profile, output a strict JSON 12-week plan:
{"items":[{"week":1,"title":"","description":"","category":"skill|project|networking|interview","resources":[{"title":"","url":""}]}, ...]}
Each week has 1-2 items. Be specific, measurable, and tailored.`;

router.post(
  "/generate",
  aiLimiter,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user?.profile?.targetRole) throw new AppError("Complete onboarding first", 400);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Profile: current=${user.profile.currentRole}, target=${user.profile.targetRole}, exp=${user.profile.experienceYears}y, skills=${(user.profile.skills || []).join(", ")}, goals=${(user.profile.goals || []).join("; ")}`,
        },
      ],
    });
    const data = JSON.parse(completion.choices[0].message.content);

    const roadmap = await Roadmap.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, targetRole: user.profile.targetRole, items: data.items, progress: 0 },
      { upsert: true, new: true },
    );
    res.json({ roadmap });
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findOne({ user: req.user.id });
    res.json({ roadmap });
  }),
);

router.patch(
  "/items/:itemId",
  asyncHandler(async (req, res) => {
    const roadmap = await Roadmap.findOne({ user: req.user.id });
    if (!roadmap) throw new AppError("No roadmap", 404);
    const item = roadmap.items.id(req.params.itemId);
    if (!item) throw new AppError("Item not found", 404);
    item.done = !!req.body.done;
    item.doneAt = item.done ? new Date() : undefined;
    const total = roadmap.items.length;
    const done = roadmap.items.filter((i) => i.done).length;
    roadmap.progress = total ? done / total : 0;
    await roadmap.save();
    res.json({ roadmap });
  }),
);

export default router;
