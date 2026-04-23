import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../config/redis.js";

const store = () =>
  new RedisStore({ sendCommand: (...args) => redis.call(...args) });

export const globalLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: store(),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: store(),
  message: { error: { message: "Too many auth attempts, try again later" } },
});

export const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  store: store(),
});
