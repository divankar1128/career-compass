import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectMongo } from "./config/mongo.js";
import { swaggerSpec } from "./config/swagger.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimit.js";

import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";
import onboardingRoutes from "./modules/onboarding/onboarding.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import resumeRoutes from "./modules/resume/resume.routes.js";
import roadmapRoutes from "./modules/roadmap/roadmap.routes.js";
import jobsRoutes from "./modules/jobs/jobs.routes.js";
import interviewRoutes from "./modules/interview/interview.routes.js";
import notificationsRoutes from "./modules/notifications/notifications.routes.js";
import billingRoutes, { webhookRouter } from "./modules/billing/billing.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";

import { ws } from "./ws/gateway.js";
import { startCronJobs } from "./jobs/cron.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.includes("*") ? true : env.corsOrigins,
    credentials: true,
  }),
);
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(cookieParser());

// Stripe webhook needs raw body — mount BEFORE json parser
app.use(`${env.apiPrefix}/billing`, webhookRouter);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(hpp());

app.use("/uploads", express.static(env.upload.dir));

app.use(env.apiPrefix, globalLimiter);

app.get(`${env.apiPrefix}/health`, (_req, res) =>
  res.json({ ok: true, env: env.nodeEnv, time: new Date().toISOString() }),
);

app.use(`${env.apiPrefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(`${env.apiPrefix}/users`, usersRoutes);
app.use(`${env.apiPrefix}/onboarding`, onboardingRoutes);
app.use(`${env.apiPrefix}/chat`, chatRoutes);
app.use(`${env.apiPrefix}/resume`, resumeRoutes);
app.use(`${env.apiPrefix}/roadmap`, roadmapRoutes);
app.use(`${env.apiPrefix}/jobs`, jobsRoutes);
app.use(`${env.apiPrefix}/interview`, interviewRoutes);
app.use(`${env.apiPrefix}/notifications`, notificationsRoutes);
app.use(`${env.apiPrefix}/billing`, billingRoutes);
app.use(`${env.apiPrefix}/admin`, adminRoutes);
app.use(`${env.apiPrefix}/analytics`, analyticsRoutes);

app.use(notFound);
app.use(errorHandler);

const httpServer = http.createServer(app);

async function bootstrap() {
  await connectMongo();
  ws.init(httpServer, env.corsOrigins.includes("*") ? true : env.corsOrigins);
  startCronJobs();
  httpServer.listen(env.port, () => {
    logger.info(`Ascend API listening on :${env.port}${env.apiPrefix}`);
    logger.info(`Swagger UI at :${env.port}${env.apiPrefix}/docs`);
  });
}

bootstrap().catch((e) => {
  logger.error("Bootstrap failed", e);
  process.exit(1);
});

const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down`);
  httpServer.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (e) => logger.error("unhandledRejection", e));
process.on("uncaughtException", (e) => {
  logger.error("uncaughtException", e);
  shutdown("uncaughtException");
});
