import cron from "node-cron";
import { aggregateFromYouTube, aggregateFromRSS, aggregateLive } from "../services/aggregator.js";
import { sendFCM } from "../services/fcmService.js";
import Notification from "../models/Notification.js";
import Waazi from "../models/Waazi.js";
import LibraryItem from "../models/LibraryItem.js";

export function scheduleJobs({ youtube, rss, fcm }) {
  console.log("✅ Scheduler initialized with config:", { youtube, rss, fcm });

  // YouTube lectures every 1 minute (test mode, sai ka koma 15 minutes a production)
  cron.schedule("*/1 * * * *", async () => {
    console.log("⏰ [CRON] YouTube job started");
    try {
      const added = await aggregateFromYouTube({ channels: youtube.channels });
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

  // RSS job da Live job suna nan yadda suke
}
