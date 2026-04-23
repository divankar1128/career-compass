import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

const connection = redis;

export const resumeQueue = new Queue("resume", { connection });
export const emailQueue = new Queue("email", { connection });
export const embeddingQueue = new Queue("embedding", { connection });
