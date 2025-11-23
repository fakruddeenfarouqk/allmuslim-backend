import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { scheduleJobs } from "./jobs/scheduler.js";

dotenv.config();

const app = express();
app.use(express.json());

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// Health route
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Import routes
import waaziRoutes from "./routes/waaziRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Register routes
app.use("/api/waazi", waaziRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/notifications", notificationRoutes);

// 🔑 Start scheduler
scheduleJobs({
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
    channels: process.env.YOUTUBE_CHANNELS?.split(",") || []
  },
  rss: {
    feeds: process.env.RSS_FEEDS?.split(",") || []
  },
  fcm: {
    serverKey: process.env.FCM_SERVER_KEY
  }
});

const PORT = process.env.PORT || 4000;

// 👇 Bind zuwa "0.0.0.0" domin ya saurari duk interfaces (IPv4)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
