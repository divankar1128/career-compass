import { Notification } from "./notification.model.js";
import { ws } from "../../ws/gateway.js";

export async function pushNotification(userId, payload) {
  const n = await Notification.create({ user: userId, ...payload });
  ws.toUser(userId.toString(), "notification", n);
  return n;
}
