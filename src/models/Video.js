import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  description: String,
  publishedAt: Date,
  channelId: String,
  thumbnail: String,
  cachedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Video", videoSchema);
