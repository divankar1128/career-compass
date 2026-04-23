import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectMongo() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, { autoIndex: env.nodeEnv !== "production" });
  logger.info("MongoDB connected");
  mongoose.connection.on("error", (err) => logger.error("Mongo error", err));
}
