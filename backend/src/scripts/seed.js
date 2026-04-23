import "dotenv/config";
import { connectMongo } from "../config/mongo.js";
import { Job } from "../modules/jobs/job.model.js";
import { InterviewQuestion } from "../modules/interview/interview.model.js";
import { logger } from "../config/logger.js";

await connectMongo();

await Job.deleteMany({});
await Job.insertMany([
  { title: "Senior Frontend Engineer", company: "Vercel", location: "Remote", remote: true, level: "senior", salaryMin: 160000, salaryMax: 220000, tags: ["react", "typescript", "next.js"], description: "Build the future of the web.", applyUrl: "https://vercel.com/careers", source: "seed" },
  { title: "Product Designer", company: "Linear", location: "Remote", remote: true, level: "mid", salaryMin: 130000, salaryMax: 170000, tags: ["figma", "design-systems"], description: "Design tools that don't suck.", applyUrl: "https://linear.app", source: "seed" },
  { title: "ML Engineer", company: "OpenAI", location: "San Francisco", remote: false, level: "senior", salaryMin: 220000, salaryMax: 350000, tags: ["python", "pytorch", "llm"], description: "Push the frontier.", applyUrl: "https://openai.com/careers", source: "seed" },
]);

await InterviewQuestion.deleteMany({});
await InterviewQuestion.insertMany([
  { type: "behavioral", difficulty: "medium", prompt: "Tell me about a time you led without authority.", rubric: ["Concrete situation", "STAR structure", "Measurable outcome"] },
  { type: "technical", difficulty: "hard", prompt: "Design a rate limiter for a public API.", rubric: ["Algorithms (token bucket / sliding window)", "Distributed concerns", "Tradeoffs"] },
  { type: "system-design", difficulty: "hard", prompt: "Design a real-time collaborative document editor.", rubric: ["CRDT/OT", "Sync protocol", "Scaling"] },
  { type: "case", difficulty: "medium", prompt: "Our DAU dropped 15% this week. How do you investigate?", rubric: ["Hypotheses", "Data slices", "Action plan"] },
]);

logger.info("Seed complete");
process.exit(0);
