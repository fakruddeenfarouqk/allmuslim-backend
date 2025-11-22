import mongoose from "mongoose";

const waaziSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    speaker: { type: String, required: true },
    dateTime: { type: Date, required: true },
    location: { type: String },
    sourceUrl: { type: String, required: true, unique: true },
    sourceType: { type: String, enum: ["youtube", "rss", "manual"], default: "youtube" },
    tags: [String]
  },
  { timestamps: true }
);

export default mongoose.model("Waazi", waaziSchema);
