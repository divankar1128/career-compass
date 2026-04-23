import winston from "winston";
import "winston-daily-rotate-file";
import { env } from "./env.js";

const fmt = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

export const logger = winston.createLogger({
  level: env.logLevel,
  format: fmt,
  transports: [
    new winston.transports.Console({
      format: env.nodeEnv === "production" ? fmt : winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    new winston.transports.DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),
  ],
});
