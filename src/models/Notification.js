import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    topic: { type: String, default: "all" },
    payload: { type: Object },
    sentAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
