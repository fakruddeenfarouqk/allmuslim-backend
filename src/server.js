import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import waaziRoutes from "./routes/waaziRoutes.js";
import libraryRoutes from "./routes/libraryRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { scheduleJobs } from "./jobs/scheduler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 👉 Logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} → ${res.statusCode} [${duration}ms]`
    );
  });
  next();
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/waazi", waaziRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// General error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

console.log("MONGO_URI from env:", MONGO_URI);

(async function start() {
  try {
    await connectDB(MONGO_URI);
    console.log("✅ Database connected successfully");

    scheduleJobs({
      youtube: {
        apiKey: process.env.YOUTUBE_API_KEY,
        channels: [
          { channelId: "UCxxxxxxxxA", maxResults: 10 },
          { channelId: "UCyyyyyyyyB", maxResults: 10 }
        ]
      },
      rss: {
        feeds: [
          {
            url: "https://example.com/waazi/rss",
            defaultLocation: "Kano",
            tags: ["waazi", "kano"]
          }
        ]
      },
      fcm: {
        serverKey: process.env.FCM_SERVER_KEY
      }
    });
    console.log("📅 Jobs scheduled");

    app.listen(PORT, () =>
      console.log(`🚀 AllMuslim API running on port ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
