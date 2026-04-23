import "dotenv/config";

const required = ["MONGO_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const k of required) {
  if (!process.env[k]) console.warn(`[config] Missing env var: ${k}`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "4000", 10),
  apiPrefix: process.env.API_PREFIX || "/api/v1",
  corsOrigins: (process.env.CORS_ORIGINS || "*").split(",").map((s) => s.trim()),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/ascend",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "dev-access",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "dev-refresh",
    accessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || "30d",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: { pro: process.env.STRIPE_PRICE_PRO, team: process.env.STRIPE_PRICE_TEAM },
  },
  upload: {
    dir: process.env.UPLOAD_DIR || "./uploads",
    maxMb: parseInt(process.env.MAX_UPLOAD_MB || "10", 10),
  },
  logLevel: process.env.LOG_LEVEL || "info",
};
