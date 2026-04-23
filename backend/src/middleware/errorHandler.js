import { logger } from "../config/logger.js";

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500;
  const payload = {
    error: {
      message: err.isOperational ? err.message : "Internal Server Error",
      code: err.code,
    },
  };
  if (status >= 500) logger.error(err.stack || err.message);
  else logger.warn(`${status} ${req.method} ${req.originalUrl} — ${err.message}`);
  res.status(status).json(payload);
}

export function notFound(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}
