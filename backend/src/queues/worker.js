import "dotenv/config";
import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import { logger } from "../config/logger.js";
import { connectMongo } from "../config/mongo.js";
import { processResume } from "../modules/resume/resume.service.js";

await connectMongo();

const connection = redis;

new Worker(
  "resume",
  async (job) => {
    if (job.name === "analyze") await processResume(job.data.resumeId);
  },
  { connection, concurrency: 4 },
).on("failed", (job, err) => logger.error(`resume job ${job?.id} failed`, err));

new Worker(
  "email",
  async (job) => {
    logger.info(`email send (stub) ${JSON.stringify(job.data)}`);
  },
  { connection, concurrency: 8 },
);

new Worker(
  "embedding",
  async (_job) => {
    // placeholder for vector embeddings
  },
  { connection, concurrency: 4 },
);

logger.info("Workers ready: resume, email, embedding");
