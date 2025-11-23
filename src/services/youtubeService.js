import axios from "axios";

const YT_API = "https://www.googleapis.com/youtube/v3";

export async function fetchChannelVideos({ apiKey, channelId, maxResults = 20 }) {
  try {
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
  } catch (err) {
    console.error("❌ [YouTube Videos Error]", err.response?.data || err.message);
    return [];
  }
}

export async function fetchLiveStream({ apiKey, channelId }) {
  try {
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

    if (!res.data.items || res.data.items.length === 0) {
      console.log("ℹ️ No live stream found for channel:", channelId);
      return null;
    }

    const item = res.data.items[0];
    return {
      title: item.snippet.title,
      speaker: item.snippet.channelTitle,
      sourceUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    };
  } catch (err) {
    console.error("❌ [YouTube Live Error]", err.response?.data || err.message);
    return null;
  }
}
