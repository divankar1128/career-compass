import { Router } from "express";
import multer from "multer";
import fs from "fs";
import { Resume } from "./resume.model.js";
import { authRequired } from "../../middleware/auth.js";
import { aiLimiter } from "../../middleware/rateLimit.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { env } from "../../config/env.js";
import { resumeQueue } from "../../queues/queues.js";

const router = Router();
router.use(authRequired);

const dir = `${env.upload.dir}/resumes`;
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (_r, f, cb) => cb(null, `${Date.now()}-${f.originalname}`),
  }),
  limits: { fileSize: env.upload.maxMb * 1024 * 1024 },
  fileFilter: (_r, f, cb) => {
    if (f.mimetype !== "application/pdf") return cb(new Error("PDF only"));
    cb(null, true);
  },
});

router.post(
  "/upload",
  aiLimiter,
  upload.single("resume"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError("No file uploaded", 400);
    const resume = await Resume.create({
      user: req.user.id,
      filename: req.file.originalname,
      path: req.file.path,
      sizeBytes: req.file.size,
      status: "queued",
    });
    await resumeQueue.add("analyze", { resumeId: resume._id.toString() });
    res.status(202).json({ resume });
  }),
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const items = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json({ items });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const r = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!r) throw new AppError("Not found", 404);
    res.json({ resume: r });
  }),
);

export default router;
