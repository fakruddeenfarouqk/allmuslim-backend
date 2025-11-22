import Notification from "../models/Notification.js";

export async function getNotifications(req, res) {
  try {
    const notes = await Notification.find().sort({ createdAt: -1 }).limit(100);
    res.json(notes);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
