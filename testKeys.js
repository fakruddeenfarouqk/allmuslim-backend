import axios from "axios";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Video from "./src/models/Video.js";
import { getApiKey, rotateKey } from "./src/utils/youtubeKeyManager.js";

dotenv.config();

async function testRoundRobin() {
  const channelId = "UC4R8DWoMoI7CAwX8_LjQHig";

  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ MongoDB connected");

  for (let i = 0; i < 5; i++) {
    try {
      const apiKey = getApiKey();
      console.log(`🔑 Using key: ${apiKey}`);

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
      console.log("✅ Success:", video.title);

    } catch (err) {
      if (err.response?.data?.error?.errors[0]?.reason === "quotaExceeded") {
        console.log("⚠️ Quota exceeded for key:", getApiKey(), "rotating...");
        rotateKey();

        const cached = await Video.findOne({ channelId }).sort({ publishedAt: -1 });
        if (cached) {
          console.log("📦 Returning cached video:", cached.title);
        }
      } else {
        console.error("❌ Error:", err.message);
      }
    }
  }

  await mongoose.disconnect();
}

testRoundRobin();
