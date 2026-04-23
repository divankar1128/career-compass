import { Router } from "express";
import Joi from "joi";
import { User } from "../users/user.model.js";
import { authRequired, requireRole } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

const router = Router();
router.use(authRequired, requireRole("admin"));

router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(req.query);
    const filter = req.query.q ? { email: new RegExp(req.query.q, "i") } : {};
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ items, page, limit, total });
  }),
);

const roleSchema = Joi.object({ role: Joi.string().valid("user", "admin").required() });

router.patch(
  "/users/:id/role",
  validate(roleSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
    res.json({ user });
  }),
);

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [users, paying, admins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: { $in: ["pro", "team"] } }),
      User.countDocuments({ role: "admin" }),
    ]);
    res.json({ users, paying, admins });
  }),
);

export default router;
