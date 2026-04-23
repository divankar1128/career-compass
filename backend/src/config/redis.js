import IORedis from "ioredis";
import { env } from "./env.js";
import { logger } from "./logger.js";

export const redis = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (e) => logger.error("Redis error", e));

export const cache = {
  async get(key) {
    const v = await redis.get(key);
    return v ? JSON.parse(v) : null;
  },
  async set(key, value, ttlSec = 300) {
    await redis.set(key, JSON.stringify(value), "EX", ttlSec);
  },
  async del(key) {
    await redis.del(key);
  },
};
