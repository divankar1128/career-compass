import { Router } from "express";
import { Notification } from "./notification.model.js";
import { authRequired } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { paginate } from "../../utils/pagination.js";

const router = Router();
router.use(authRequired);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { skip, limit, page } = paginate(req.query);
    const [items, total, unread] = await Promise.all([
      Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments({ user: req.user.id }),
      Notification.countDocuments({ user: req.user.id, read: false }),
    ]);
    res.json({ items, page, limit, total, unread });
  }),
);

router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    await Notification.updateOne({ _id: req.params.id, user: req.user.id }, { read: true });
    res.json({ ok: true });
  }),
);

router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ ok: true });
  }),
);

export default router;
