import { Router } from "express";
import Joi from "joi";
import { InterviewQuestion, InterviewAnswer } from "./interview.model.js";
import { authRequired } from "../../middleware/auth.js";
import { aiLimiter } from "../../middleware/rateLimit.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { openai, OPENAI_MODEL } from "../../config/openai.js";

const router = Router();
router.use(authRequired);

router.get(
  "/questions",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const items = await InterviewQuestion.find(filter).limit(50);
    res.json({ items });
  }),
);

const answerSchema = Joi.object({
  questionId: Joi.string().required(),
  transcript: Joi.string().min(10).max(8000).required(),
});

router.post(
  "/answers",
  aiLimiter,
  validate(answerSchema),
  asyncHandler(async (req, res) => {
    const q = await InterviewQuestion.findById(req.body.questionId);
    if (!q) throw new AppError("Question not found", 404);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an interview coach. Score answer 0-10 on content, structure (STAR), delivery (clarity/concision). Return strict JSON: {"score":n,"breakdown":{"content":n,"structure":n,"delivery":n},"feedback":"","suggestions":[]}`,
        },
        {
          role: "user",
          content: `Question (${q.type}, ${q.difficulty}): ${q.prompt}\n\nRubric: ${(q.rubric || []).join("; ")}\n\nAnswer:\n${req.body.transcript}`,
        },
      ],
    });
    const data = JSON.parse(completion.choices[0].message.content);
    const answer = await InterviewAnswer.create({
      user: req.user.id,
      question: q._id,
      transcript: req.body.transcript,
      ...data,
    });
    res.status(201).json({ answer });
  }),
);

router.get(
  "/answers",
  asyncHandler(async (req, res) => {
    const items = await InterviewAnswer.find({ user: req.user.id })
      .populate("question", "prompt type difficulty")
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ items });
  }),
);

export default router;
