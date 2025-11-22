import Waazi from "../models/Waazi.js";
import LibraryItem from "../models/LibraryItem.js";
import { fetchChannelVideos, fetchLiveStream } from "./youtubeService.js";
import { fetchRssFeed } from "./rssService.js";

export async function aggregateFromYouTube({ apiKey, channels = [] }) {
  const results = [];
  for (const ch of channels) {
    const videos = await fetchChannelVideos({ apiKey, channelId: ch.channelId, maxResults: ch.maxResults || 20 });
    for (const v of videos) {
      // Save into Library (video lectures)
      await LibraryItem.updateOne(
        { sourceUrl: v.sourceUrl },
        {
          $setOnInsert: {
            title: v.title,
            speaker: v.speaker,
            type: "video",
            sourceUrl: v.sourceUrl,
            publishedAt: v.publishedAt ? new Date(v.publishedAt) : new Date()
          }
        },
        { upsert: true }
      );
      results.push(v);
    }
  }
  return results;
}

export async function aggregateFromRSS({ feeds = [] }) {
  const saved = [];
  for (const f of feeds) {
    const items = await fetchRssFeed(f.url);
    for (const it of items) {
      const doc = await Waazi.updateOne(
        { sourceUrl: it.sourceUrl },
        {
          $setOnInsert: {
            title: it.title,
            speaker: it.speaker,
            dateTime: it.dateTime,
            location: f.defaultLocation || "",
            sourceUrl: it.sourceUrl,
            sourceType: "rss",
            tags: f.tags || []
          }
        },
        { upsert: true }
      );
      if (doc.upsertedCount) saved.push(it);
    }
  }
  return saved;
}

export async function aggregateLive({ apiKey, channels = [] }) {
  const lives = [];
  for (const ch of channels) {
    const live = await fetchLiveStream({ apiKey, channelId: ch.channelId });
    if (live) lives.push(live);
  }
  return lives;
}
