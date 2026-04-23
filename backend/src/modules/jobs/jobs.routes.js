import { Router } from "express";
import { Job } from "./job.model.js";
import { User } from "../users/user.model.js";
import { authRequired } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";
import { cache } from "../../config/redis.js";

const router = Router();
router.use(authRequired);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(req.query);
    const filter = {};
    if (req.query.q) filter.$text = { $search: req.query.q };
    if (req.query.remote) filter.remote = req.query.remote === "true";
    if (req.query.level) filter.level = req.query.level;
    if (req.query.tag) filter.tags = req.query.tag;

    const [items, total] = await Promise.all([
      Job.find(filter).sort({ postedAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(filter),
    ]);
    res.json({ items, page, limit, total });
  }),
);

// Recommended: cached per-user, scored against profile skills overlap
router.get(
  "/recommended",
  asyncHandler(async (req, res) => {
    const cacheKey = `jobs:rec:${req.user.id}`;
    const cached = await cache.get(cacheKey);
    if (cached) return res.json(cached);

    const user = await User.findById(req.user.id).select("profile");
    const skills = (user?.profile?.skills || []).map((s) => s.toLowerCase());
    const target = user?.profile?.targetRole;

    const candidates = await Job.find(
      target ? { $or: [{ title: new RegExp(target, "i") }, { tags: { $in: skills } }] } : {},
    )
      .sort({ postedAt: -1 })
      .limit(100);

    const scored = candidates
      .map((j) => {
        const overlap = (j.tags || []).filter((t) => skills.includes(t.toLowerCase())).length;
        const score = Math.min(100, Math.round((overlap / Math.max(1, skills.length)) * 100));
        return { job: j, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 25);

    const out = { items: scored };
    await cache.set(cacheKey, out, 300);
    res.json(out);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);
    res.json({ job });
  }),
);

export default router;
