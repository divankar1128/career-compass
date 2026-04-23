import cron from "node-cron";
import { logger } from "../config/logger.js";
import { User } from "../modules/users/user.model.js";
import { pushNotification } from "../modules/notifications/notification.service.js";

export function startCronJobs() {
  // Daily 8am: weekly progress digest for active users
  cron.schedule("0 8 * * *", async () => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({ lastLoginAt: { $gte: since } }).select("_id");
    for (const u of users) {
      await pushNotification(u._id, {
        type: "digest",
        title: "Your weekly progress",
        body: "See your roadmap progress and AI insights.",
        link: "/dashboard",
      });
    }
    logger.info(`Sent digest to ${users.length} users`);
  });

  // Hourly cleanup of stale resume uploads (failed > 24h)
  cron.schedule("0 * * * *", async () => {
    logger.info("Cron: cleanup tick");
  });

  logger.info("Cron jobs scheduled");
}
