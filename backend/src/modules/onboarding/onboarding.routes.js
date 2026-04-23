import { Router } from "express";
import Joi from "joi";
import { User } from "../users/user.model.js";
import { authRequired } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const router = Router();
router.use(authRequired);

const onboardingSchema = Joi.object({
  currentRole: Joi.string().max(120).required(),
  experienceYears: Joi.number().min(0).max(60).required(),
  targetRole: Joi.string().max(120).required(),
  skills: Joi.array().items(Joi.string().max(40)).min(1).max(50).required(),
  goals: Joi.array().items(Joi.string().max(120)).min(1).max(10).required(),
});

router.post(
  "/",
  validate(onboardingSchema),
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { onboarded: true, "profile.currentRole": req.body.currentRole, "profile.experienceYears": req.body.experienceYears, "profile.targetRole": req.body.targetRole, "profile.skills": req.body.skills, "profile.goals": req.body.goals } },
      { new: true },
    );
    res.json({ user });
  }),
);

export default router;
