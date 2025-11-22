import axios from "axios";

const YT_API = "https://www.googleapis.com/youtube/v3";

export async function fetchChannelVideos({ apiKey, channelId, maxResults = 20 }) {
  const res = await axios.get(`${YT_API}/search`, {
    params: {
      key: apiKey,
      channelId,
      part: "snippet",
      order: "date",
      maxResults
    }
  });
  return res.data.items
    .filter(item => item.id?.videoId)
    .map(item => ({
      title: item.snippet.title,
      speaker: item.snippet.channelTitle,
      sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt
    }));
}

export async function fetchLiveStream({ apiKey, channelId }) {
  const res = await axios.get(`${YT_API}/search`, {
    params: {
      key: apiKey,
      channelId,
      part: "snippet",
      eventType: "live",
      type: "video",
      maxResults: 1
    }
  });
  const item = res.data.items?.[0];
  if (!item) return null;
  return {
    title: item.snippet.title,
    speaker: item.snippet.channelTitle,
    sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
  };
}
