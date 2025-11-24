import axios from "axios";
import Video from "../models/Video.js";
import { getApiKey, rotateKey } from "../utils/youtubeKeyManager.js";

export async function aggregateFromYouTube({ channels }) {
  const results = [];
  for (const channelId of channels) {
    try {
      // Duba cache
      const cached = await Video.findOne({ channelId }).sort({ publishedAt: -1 });
      if (cached && (Date.now() - cached.cachedAt.getTime()) < 10 * 60 * 1000) {
        console.log("📦 Returning cached video for channel:", channelId);
        results.push(cached);
        continue;
      }

      // Kira YouTube API
      const apiKey = getApiKey();
      console.log("🔑 Using key:", apiKey);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${apiKey}`;
      const res = await axios.get(url);

      const item = res.data.items[0];
      const video = {
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        channelId,
        thumbnail: item.snippet.thumbnails.default.url,
        cachedAt: new Date()
      };

      await Video.findOneAndUpdate({ videoId: video.videoId }, video, { upsert: true });
      results.push(video);

    } catch (err) {
      if (err.response?.data?.error?.errors[0]?.reason === "quotaExceeded") {
        console.log("⚠️ Quota exceeded for key:", getApiKey(), "rotating...");
        rotateKey(); // juya zuwa key na gaba

        // fallback: dawo da cache idan akwai
        const cached = await Video.findOne({ channelId }).sort({ publishedAt: -1 });
        if (cached) {
          console.log("📦 Returning cached video:", cached.title);
          results.push(cached);
        }
      } else {
        console.error("❌ [YouTube Aggregator Error]", err.message);
      }
    }
  }
  return results;
}

// RSS da Live suna nan yadda suke
export async function aggregateFromRSS({ feeds }) {
  // ... logic naka na RSS
}

export async function aggregateLive({ channels }) {
  // ... logic naka na Live
}
