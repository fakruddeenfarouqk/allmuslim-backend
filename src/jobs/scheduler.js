import cron from "node-cron";
import { aggregateFromYouTube, aggregateFromRSS, aggregateLive } from "../services/aggregator.js";
import { sendFCM } from "../services/fcmService.js";
import Notification from "../models/Notification.js";

export function scheduleJobs({ youtube, rss, fcm }) {
  // Every 15 minutes: fetch YouTube lectures
  cron.schedule("*/15 * * * *", async () => {
    const added = await aggregateFromYouTube({ apiKey: youtube.apiKey, channels: youtube.channels });
    if (added.length) {
      const message = `New lectures: ${added.length}`;
      await Notification.create({ message, payload: { count: added.length } });
      if (fcm?.serverKey) {
        await sendFCM({
          serverKey: fcm.serverKey,
          title: "AllMuslim",
          body: message,
          topic: "all",
          data: { type: "library_update", count: added.length }
        });
      }
      console.log("YouTube aggregation: ", added.length);
    }
  });

  // Every hour: fetch wa’azi schedules from RSS
  cron.schedule("0 * * * *", async () => {
    const saved = await aggregateFromRSS({ feeds: rss.feeds });
    if (saved.length) {
      const message = `New wa’azi scheduled: ${saved.length}`;
      await Notification.create({ message, payload: { count: saved.length } });
      if (fcm?.serverKey) {
        await sendFCM({
          serverKey: fcm.serverKey,
          title: "AllMuslim",
          body: message,
          topic: "all",
          data: { type: "waazi_update", count: saved.length }
        });
      }
      console.log("RSS aggregation: ", saved.length);
    }
  });

  // Every 5 minutes: check live streams
  cron.schedule("*/5 * * * *", async () => {
    const lives = await aggregateLive({ apiKey: youtube.apiKey, channels: youtube.channels });
    if (lives.length) {
      const message = `Live wa’azi ongoing: ${lives[0].title}`;
      await Notification.create({ message, payload: { lives } });
      if (fcm?.serverKey) {
        await sendFCM({
          serverKey: fcm.serverKey,
          title: "AllMuslim Live",
          body: message,
          topic: "all",
          data: { type: "live", lives }
        });
      }
      console.log("Live streams found: ", lives.length);
    }
  });
}
