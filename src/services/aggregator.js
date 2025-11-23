import { fetchChannelVideos, fetchLiveStream } from "./youtubeService.js";
import { fetchRssFeed } from "./rssService.js";

// YouTube lectures
export async function aggregateFromYouTube({ apiKey, channels }) {
  let results = [];
  for (const channelId of channels) {
    console.log("📡 Fetching YouTube channel:", channelId);
    const videos = await fetchChannelVideos({ apiKey, channelId });
    // normalize zuwa LibraryItem format
    const normalized = videos.map(v => ({
      title: v.title,
      speaker: v.channelTitle,
      type: "video",
      sourceUrl: v.url,
      durationSec: v.durationSec,
      publishedAt: v.publishedAt
    }));
    results = results.concat(normalized);
  }
  return results;
}

// RSS wa’azi
export async function aggregateFromRSS({ feeds }) {
  let results = [];
  for (const url of feeds) {
    console.log("📰 Fetching RSS feed:", url);
    const items = await fetchRssFeed(url);
    // normalize zuwa Waazi format
    const normalized = items.map(i => ({
      title: i.title,
      speaker: i.creator || "Unknown",
      dateTime: i.isoDate,
      location: i.location || "",
      sourceUrl: i.link,
      sourceType: "rss",
      tags: ["rss"]
    }));
    results = results.concat(normalized);
  }
  return results;
}

// Live streams
export async function aggregateLive({ apiKey, channels }) {
  let lives = [];
  for (const channelId of channels) {
    console.log("🔴 Checking live stream for:", channelId);
    const live = await fetchLiveStream({ apiKey, channelId });
    if (live) {
      lives.push({
        title: live.title,
        speaker: live.channelTitle,
        dateTime: live.startTime,
        location: live.location || "",
        sourceUrl: live.url,
        sourceType: "youtube",
        tags: ["live"]
      });
    }
  }
  return lives;
}
