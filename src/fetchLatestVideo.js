const axios = require('axios');
const Video = require('./models/Video');

async function fetchLatestVideo(channelId) {
  try {
    const cached = await Video.findOne({ channelId }).sort({ publishedAt: -1 });
    if (cached && (Date.now() - cached.cachedAt.getTime()) < 10 * 60 * 1000) {
      console.log("Returning cached video...");
      return cached;
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1&order=date&type=video&key=${apiKey}`;
    const res = await axios.get(url);

    const item = res.data.items[0];
    const video = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      channelId,
      thumbnail: item.snippet.thumbnails.default.url
    };

    await Video.findOneAndUpdate({ videoId: video.videoId }, video, { upsert: true });
    return video;

  } catch (err) {
    console.error("Error fetching video:", err.message);
    const cached = await Video.findOne({ channelId }).sort({ publishedAt: -1 });
    if (cached) {
      console.log("Quota exceeded, returning cached video...");
      return cached;
    }
    throw err;
  }
}

module.exports = fetchLatestVideo;
