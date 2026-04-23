import { Router } from "express";
import Joi from "joi";
import multer from "multer";
import path from "path";
import fs from "fs";
import { User } from "./user.model.js";
import { authRequired } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { env } from "../../config/env.js";

const router = Router();
router.use(authRequired);

if (!fs.existsSync(env.upload.dir)) fs.mkdirSync(env.upload.dir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: env.upload.dir,
    filename: (_r, f, cb) => cb(null, `${Date.now()}-${f.originalname}`),
  }),
  limits: { fileSize: env.upload.maxMb * 1024 * 1024 },
  fileFilter: (_r, f, cb) => {
    if (!/^image\/(png|jpe?g|webp)$/.test(f.mimetype)) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

const updateSchema = Joi.object({
  name: Joi.string().max(80),
  profile: Joi.object({
    headline: Joi.string().max(160),
    bio: Joi.string().max(2000),
    location: Joi.string().max(120),
    currentRole: Joi.string().max(120),
    experienceYears: Joi.number().min(0).max(60),
    targetRole: Joi.string().max(120),
    skills: Joi.array().items(Joi.string().max(40)).max(50),
    goals: Joi.array().items(Joi.string().max(120)).max(20),
  }),
}).min(1);

router.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ user });
  }),
);

router.patch(
  "/me",
  validate(updateSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.user.id, { $set: flatten(req.body) }, { new: true });
    res.json({ user });
  }),
);

router.post(
  "/me/avatar",
  upload.single("avatar"),
  asyncHandler(async (req, res) => {
    const url = `/uploads/${path.basename(req.file.path)}`;
    const user = await User.findByIdAndUpdate(req.user.id, { avatarUrl: url }, { new: true });
    res.json({ user });
  }),
);

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

export default router;
