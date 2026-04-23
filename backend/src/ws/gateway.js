import { Server } from "socket.io";
import { verifyAccess } from "../utils/jwt.js";
import { logger } from "../config/logger.js";

let io = null;

export const ws = {
  init(httpServer, corsOrigins) {
    io = new Server(httpServer, {
      cors: { origin: corsOrigins, credentials: true },
      path: "/ws",
    });

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("missing token"));
        const decoded = verifyAccess(token);
        socket.userId = decoded.sub;
        next();
      } catch (e) {
        next(new Error("invalid token"));
      }
    });

    io.on("connection", (socket) => {
      socket.join(`user:${socket.userId}`);
      logger.info(`WS connect user=${socket.userId}`);
      socket.on("disconnect", () => logger.info(`WS disconnect user=${socket.userId}`));
    });
  },

  toUser(userId, event, payload) {
    io?.to(`user:${userId}`).emit(event, payload);
  },

  broadcast(event, payload) {
    io?.emit(event, payload);
  },
};
