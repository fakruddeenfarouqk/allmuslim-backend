import cron from "node-cron";
import { aggregateFromYouTube, aggregateFromRSS, aggregateLive } from "../services/aggregator.js";
import { sendFCM } from "../services/fcmService.js";
import Notification from "../models/Notification.js";
import Waazi from "../models/Waazi.js";
import LibraryItem from "../models/LibraryItem.js";

export function scheduleJobs({ youtube, rss, fcm }) {
  console.log("✅ Scheduler initialized with config:", { youtube, rss, fcm });

  // YouTube lectures every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    console.log("⏰ [CRON] YouTube job started");
    try {
      const added = await aggregateFromYouTube({ apiKey: youtube.apiKey, channels: youtube.channels });
      console.log("📺 [YouTube] Added:", added.length);

      for (const lecture of added) {
        await LibraryItem.updateOne(
          { sourceUrl: lecture.sourceUrl },
          {
            $setOnInsert: {
              title: lecture.title,
              speaker: lecture.speaker,
              type: "video",
              sourceUrl: lecture.sourceUrl,
              durationSec: lecture.durationSec,
              publishedAt: lecture.publishedAt
            }
          },
          { upsert: true }
        );
      }

      if (added.length) {
        const message = `New lectures: ${added.length}`;
        await Notification.create({ message, payload: { count: added.length } });
        console.log("💾 [DB] Notification saved");

        if (fcm?.serverKey) {
          await sendFCM({
            serverKey: fcm.serverKey,
            title: "AllMuslim",
            body: message,
            topic: "all",
            data: { type: "library_update", count: added.length }
          });
          console.log("📲 [FCM] Push sent");
        }
      }
    } catch (err) {
      console.error("❌ [YouTube Job Error]", err);
    }
  });

  // RSS wa’azi schedules every hour
  cron.schedule("0 * * * *", async () => {
    console.log("⏰ [CRON] RSS job started");
    try {
      const saved = await aggregateFromRSS({ feeds: rss.feeds });
      console.log("📰 [RSS] Saved:", saved.length);

      for (const waazi of saved) {
        await Waazi.updateOne(
          { sourceUrl: waazi.sourceUrl },
          {
            $setOnInsert: {
              title: waazi.title,
              speaker: waazi.speaker,
              dateTime: waazi.dateTime,
              location: waazi.location,
              sourceUrl: waazi.sourceUrl,
              sourceType: "rss",
              tags: waazi.tags || []
            }
          },
          { upsert: true }
        );
      }

      if (saved.length) {
        const message = `New wa’azi scheduled: ${saved.length}`;
        await Notification.create({ message, payload: { count: saved.length } });
        console.log("💾 [DB] Notification saved");

        if (fcm?.serverKey) {
          await sendFCM({
            serverKey: fcm.serverKey,
            title: "AllMuslim",
            body: message,
            topic: "all",
            data: { type: "waazi_update", count: saved.length }
          });
          console.log("📲 [FCM] Push sent");
        }
      }
    } catch (err) {
      console.error("❌ [RSS Job Error]", err);
    }
  });

  // Live streams every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ [CRON] Live job started");
    try {
      const lives = await aggregateLive({ apiKey: youtube.apiKey, channels: youtube.channels });
      console.log("🔴 [Live] Found:", lives.length);

      for (const live of lives) {
        await Waazi.updateOne(
          { sourceUrl: live.sourceUrl },
          {
            $setOnInsert: {
              title: live.title,
              speaker: live.speaker,
              dateTime: live.dateTime,
              location: live.location,
              sourceUrl: live.sourceUrl,
              sourceType: "youtube",
              tags: ["live"]
            }
          },
          { upsert: true }
        );
      }

      if (lives.length) {
        const message = `Live wa’azi ongoing: ${lives[0].title}`;
        await Notification.create({ message, payload: { lives } });
        console.log("💾 [DB] Live notification saved");

        if (fcm?.serverKey) {
          await sendFCM({
            serverKey: fcm.serverKey,
            title: "AllMuslim Live",
            body: message,
            topic: "all",
            data: { type: "live", lives }
          });
          console.log("📲 [FCM] Push sent");
        }
      }
    } catch (err) {
      console.error("❌ [Live Job Error]", err);
    }
  });
}
