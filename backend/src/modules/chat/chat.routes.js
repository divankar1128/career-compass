import { Router } from "express";
import Joi from "joi";
import { Conversation } from "./chat.model.js";
import { authRequired } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { aiLimiter } from "../../middleware/rateLimit.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { openai, OPENAI_MODEL } from "../../config/openai.js";
import { paginate } from "../../utils/pagination.js";
import { User } from "../users/user.model.js";

const router = Router();
router.use(authRequired);

const SYSTEM_PROMPT = `You are Ascend, an elite AI career coach. Be specific, actionable, and warm.
Cite frameworks (STAR, OKRs, T-shaped skills) where useful. Keep replies under 250 words unless asked.`;

const sendSchema = Joi.object({ content: Joi.string().min(1).max(4000).required() });

router.post(
  "/conversations",
  asyncHandler(async (req, res) => {
    const c = await Conversation.create({ user: req.user.id, title: "New conversation" });
    res.status(201).json({ conversation: c });
  }),
);

router.get(
  "/conversations",
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(req.query);
    const [items, total] = await Promise.all([
      Conversation.find({ user: req.user.id })
        .select("title updatedAt createdAt")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ user: req.user.id }),
    ]);
    res.json({ items, page, limit, total });
  }),
);

router.get(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    const c = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!c) throw new AppError("Not found", 404);
    res.json({ conversation: c });
  }),
);

router.delete(
  "/conversations/:id",
  asyncHandler(async (req, res) => {
    await Conversation.deleteOne({ _id: req.params.id, user: req.user.id });
    res.status(204).end();
  }),
);

// SSE streaming
router.post(
  "/conversations/:id/messages",
  aiLimiter,
  validate(sendSchema),
  asyncHandler(async (req, res) => {
    const conv = await Conversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!conv) throw new AppError("Conversation not found", 404);

    conv.messages.push({ role: "user", content: req.body.content });
    if (conv.messages.length === 1) conv.title = req.body.content.slice(0, 60);
    await conv.save();

    const user = await User.findById(req.user.id).select("profile");
    const persona = user?.profile
      ? `User profile: role=${user.profile.currentRole || "?"}, target=${user.profile.targetRole || "?"}, exp=${user.profile.experienceYears ?? "?"}y, skills=${(user.profile.skills || []).join(", ")}.`
      : "";

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const stream = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      stream: true,
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n${persona}` },
        ...conv.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    let assistant = "";
    try {
      for await (const part of stream) {
        const delta = part.choices?.[0]?.delta?.content || "";
        if (delta) {
          assistant += delta;
          res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }
      }
      conv.messages.push({ role: "assistant", content: assistant });
      await conv.save();
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (e) {
      res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
      res.end();
    }
  }),
);

export default router;
