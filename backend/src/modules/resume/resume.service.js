import fs from "fs/promises";
import pdf from "pdf-parse";
import { openai, OPENAI_MODEL } from "../../config/openai.js";
import { Resume } from "./resume.model.js";

const RUBRIC = `Score a resume 0-100 across: content, structure, keywords, impact, formatting.
Return strict JSON with shape:
{"score":number,"breakdown":{"content":n,"structure":n,"keywords":n,"impact":n,"formatting":n},"strengths":[],"gaps":[],"suggestions":[]}`;

export async function processResume(resumeId) {
  const resume = await Resume.findById(resumeId);
  if (!resume) return;
  resume.status = "processing";
  await resume.save();
  try {
    const buf = await fs.readFile(resume.path);
    const parsed = await pdf(buf);
    resume.text = parsed.text.slice(0, 50_000);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: RUBRIC },
        { role: "user", content: `Resume text:\n\n${resume.text}` },
      ],
    });
    const data = JSON.parse(completion.choices[0].message.content);
    Object.assign(resume, {
      score: data.score,
      breakdown: data.breakdown,
      strengths: data.strengths || [],
      gaps: data.gaps || [],
      suggestions: data.suggestions || [],
      status: "ready",
    });
    await resume.save();
  } catch (e) {
    resume.status = "failed";
    resume.error = e.message;
    await resume.save();
  }
}
