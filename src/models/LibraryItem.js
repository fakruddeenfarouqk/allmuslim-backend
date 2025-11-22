import mongoose from "mongoose";

const libraryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    speaker: { type: String },
    type: { type: String, enum: ["audio", "video", "pdf"], required: true },
    sourceUrl: { type: String, required: true, unique: true },
    durationSec: { type: Number },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model("LibraryItem", libraryItemSchema);
